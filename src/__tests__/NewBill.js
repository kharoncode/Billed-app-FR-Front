/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";

import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// simulate automatically the mockStore
jest.mock("../app/Store.js", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Setup befor each test
    beforeEach(()=>{
      // Pretending we're connected like an employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'e@e'
      }));
      // Setting up the router
      document.body.innerHTML = `<div id="root"></div>`;
      router();
      // Launch the NewBill page
      window.onNavigate(ROUTES_PATH.NewBill)
    });
    // Clear the localStorage after each test
    afterEach(() => {
      window.localStorage.clear();
    });

    test("Then NewBill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
    })

    describe("When I send a file with a wrong extension", ()=>{
      // Setup befor each test
      beforeEach(()=>{
        const input = screen.getByTestId("file");
        // Mock a file with the wrong extension
        fireEvent.change(input, {
          target: {
            files: [new File(["wrong"], "wrong.pdf", { type: "application/pdf" })],
          },
        });
      })
      test("Then input file value should be empty", ()=>{
        const input = screen.getByTestId("file");
        expect(input.value).toEqual("");
      })
      test("Then error message should disapear if we send a file with a right extension", ()=>{
        const input = screen.getByTestId("file");
        let iconError = document.querySelector('.iconError');
        expect(iconError).not.toBeNull();
        // Send a mock file with the correct extension
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
        // Send a mock file with the correct extension
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
        // Mock function handleSubmit()
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
    // Setup befor each test
    beforeEach(() => {
      // Creates mock function
      jest.spyOn(mockStore, "bills");
      // And record all calls
      jest.spyOn(console, "error").mockImplementation(() => {});
      // Pretending we're connected like an employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'e@e'
      }));
      // Setting up the router
      document.body.innerHTML = `<div id="root"></div>`;
      router();
      // Launch the NewBill page
      window.onNavigate(ROUTES_PATH.NewBill);
      document.body.innerHTML = NewBillUI();
    });
    // Clear the localStorage and the console.error after each test
    afterEach(() => {
      window.localStorage.clear();
      console.error.mockClear();
    });
    
    test("Then updateBill methode should be called", () => {
      // Mock function handleSubmit()
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      // Mock function updateBill()
      newBill.updateBill = jest.fn();
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      // Check if function updateBill() have been called
      expect(newBill.updateBill).toHaveBeenCalled();
    });
    describe("When an error occurs on API", () => {
      test("Send message to an API and fails with 500 message error", async () => {
        // Simulates an error return: erreur 500
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update : () =>  {
              return Promise.reject(new Error("Erreur 500"));
            }
          }
        });
        // Mock function handleSubmit()
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        // We make sure that the promise is charged as a priority
        await new Promise(process.nextTick);
        // Check that console.error has been called and that it contains the error message sent
        expect(console.error).toBeCalled();
        const error = new Error("Erreur 500");
        expect(console.error.mock.calls[0][0]).toEqual(error);
      });
      test("Send message to an API and fails with 404 message error", async () => {
        // Simulates an error return: erreur 404
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update : () =>  {
              return Promise.reject(new Error("Erreur 404"));
            }
          }
        });
        // Mock function handleSubmit()
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        // We make sure that the promise is charged as a priority
        await new Promise(process.nextTick);
        // Check that console.error has been called and that it contains the error message sent
        expect(console.error).toBeCalled();
        const error = new Error("Erreur 404");
        expect(console.error.mock.calls[0][0]).toEqual(error);
      });
    });
  });
});