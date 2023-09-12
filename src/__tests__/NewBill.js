/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";

import mockStore from "../__mocks__/store";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'e@e'
      }));
      document.body.innerHTML = `<div id="root"></div>`;
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    });

    afterEach(() => {
      window.localStorage.clear();
    });

    test("Then NewBill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
    })

    describe("When I send a file with a wrong extension", ()=>{
      beforeEach(()=>{
        const input = screen.getByTestId("file");
        fireEvent.change(input, {
          target: {
            files: [new File(["wrong"], "wrong.pdf", { type: "application/pdf" })],
          },
        });
      })
      test("Then Justificatif should be empty", ()=>{
        const input = screen.getByTestId("file");
        expect(input.files.length).toEqual(0);
      })
      test("Then error message should disapear if we send a file with a right extension", ()=>{
        const input = screen.getByTestId("file");
        let iconError = document.querySelector('.iconError');
        expect(iconError).not.toBeNull();
        fireEvent.change(input, {
          target: {
            files: [new File(["right"], "right.png", { type: "image/png" })],
          },
        });
        iconError = document.querySelector('.iconError');
        expect(iconError).toBeNull();
      })
      
    })

    describe("When I send a file with a right extension",()=>{
      test("Then Justificatif should not be empty",()=>{
        const input = screen.getByTestId("file");
        fireEvent.change(input, {
          target: {
            files: [new File(["right"], "right.png", { type: "image/png" })],
          },
        });
        expect(input.files.length).not.toEqual(0);
        }) 
    })

    describe("When I Submit the form",()=>{
      test("Then invalidate form should return NewBill page",()=>{
        const form = screen.getByTestId("form-new-bill");
        expect(form.reportValidity()).not.toBeTruthy();
        fireEvent.submit(form);
        expect(form).toBeTruthy();
      })

      test("Then handleSubmit methode should be called",()=>{
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(handleSubmit).toHaveBeenCalled();
      })
    })

  })
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I submit", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      jest.spyOn(console, "error").mockImplementation(() => {});
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'e@e'
      }));
      document.body.innerHTML = `<div id="root"></div>`;
      router();

      window.onNavigate(ROUTES_PATH.NewBill)
    });
    afterEach(() => {
      window.localStorage.clear();
      console.error.mockClear();
    });
    
    test("Then updateBill methode should be called", () => {
      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      newBill.updateBill = jest.fn();
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(newBill.updateBill).toHaveBeenCalled();
    });
    describe("When an error occurs on API", () => {
      test("Send message to an API and fails with 500 message error", async () => {
        document.body.innerHTML = NewBillUI();
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update : () =>  {
              return Promise.reject(new Error("Erreur 500"));
            }
          }
        });
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        await new Promise(process.nextTick);

        expect(console.error).toBeCalled();
        const error = new Error("Erreur 500");
        expect(console.error.mock.calls[0][0]).toEqual(error);
      });
    });
  });
});