/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH} from "../constants/routes.js";

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
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
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

    
    /* test("Then invalidate Submit should return NewBill page",async ()=>{
      await waitFor(()=> screen.getByTestId("btn-send-bill"));
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Vol Test";
      screen.getByTestId("datepicker").value = "1985-12-05";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("vat").value = "50";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "Comment Test";
      //const mockfile = new File(["hello"], "hello.png", { type: "image/png" });
      const input = screen.getByTestId("file");
      expect(input.reportValidity()).not.toBeTruthy();
      //userEvent.upload(input, mockfile);
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form)
      expect(form.reportValidity()).not.toBeTruthy();
      expect(form).toBeTruthy();
    }) */

  })
})

// test d'intégration POST
/* describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBills", () => {
    test("Send bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ data: bills })
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByTestId("tbody")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
}) */