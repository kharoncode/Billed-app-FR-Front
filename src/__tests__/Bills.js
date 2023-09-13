/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import  billsPage  from "../containers/Bills.js";
import { ROUTES_PATH} from "../constants/routes.js";

import mockStore from "../__mocks__/store";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// simulate automatically the mockStore
jest.mock("../app/Store.js", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true);

    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then it should show the justificatif when we click on icon-eye", async ()=>{
      // Pretending we're connected like an employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Setting up the router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      // Launch the Bills page
      window.onNavigate(ROUTES_PATH.Bills)
      const iconEyes = screen.getAllByTestId("icon-eye");
      const iconEye = iconEyes[0];
      // Mock function handleClickIconEye()
      const bills = new billsPage({ 
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,  });
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(()=> {bills.handleClickIconEye(iconEye)})
      iconEye.addEventListener("click", handleClickIconEye)
      userEvent.click(iconEye);
      // Check if Justificatif's modal is display
      await waitFor(()=> screen.getByTestId("modaleFile"));
      const modalBill = screen.getByTestId("modaleFile");
      expect(modalBill).toBeTruthy();
      expect(modalBill).toHaveStyle('display:block');
    })
    
    test("Then it should redirect to NewBill when we click on button New Bill", async ()=>{
      // Pretending we're connected like an employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Setting up the router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      // Launch the Bills page
      window.onNavigate(ROUTES_PATH.Bills)
      // Check if NewBill page has loaded
      const button = screen.getByTestId('btn-new-bill');
      userEvent.click(button);
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeDefined();
    })

    test("Then getBills should return format store", async ()=>{
      // Mock Document
      const mockDocument = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn()
      };
      // Mock OnNavigate
      const mockOnNavigate = jest.fn();
      // Mock function getBills()
      const bills = new billsPage({ 
        document: mockDocument,
        onNavigate: mockOnNavigate,
        store: mockStore,
        localStorage: localStorageMock,  });
      const mockBills = await bills.getBills();
      // Check that the length of the Object returned by getBills is equal to that of mockBills.list
      expect(Object.keys(mockBills).length).toBe(4);
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      // Pretending we're connected like an employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Setting up the router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      // Launch the Bills page
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ data: bills })
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByTestId("tbody")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    // Setup befor each test
    beforeEach(() => {
      // Creates mock function
      jest.spyOn(mockStore, "bills");
      // Pretending we're connected like an employee
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }));
      // Setting up the router
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router();
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      // Simulates an error return: erreur 404
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      // Launch the Bills page
      window.onNavigate(ROUTES_PATH.Bills);
      // We make sure that the promise is charged as a priority
      await new Promise(process.nextTick);
      // Check that the error message displays Erreur 404
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      // Simulates an error return: erreur 500
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }});
      // Launch the Bills page
      window.onNavigate(ROUTES_PATH.Bills)
      // We make sure that the promise is charged as a priority
      await new Promise(process.nextTick);
      // Check that the error message displays Erreur 500
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})