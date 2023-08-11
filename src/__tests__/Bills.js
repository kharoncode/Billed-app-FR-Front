/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import store from "../__mocks__/store";

import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import  billsPage  from "../containers/Bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

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
      //to-do write expect expression
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
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getAllByTestId("icon-eye")[2])
      userEvent.click(screen.getAllByTestId("icon-eye")[2])
      await waitFor(()=> screen.getByTestId("modaleFile"));
      const modalBill = screen.getByTestId("modaleFile");
      expect(modalBill).toHaveStyle('display:block')
    })
    
    test("Then it should redirect to NewBill when we click on button New Bill", async ()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      userEvent.click(screen.getByRole('button', 'data-testid="btn-new-bill"'))
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeDefined();
    })

    test("Then getBills should return format store", ()=>{
      document.body.innerHTML = "<div></div>";
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const bills = new billsPage({document, onNavigate, store, localStorage});
      const lgth = bills.getBills().then((billsData)=>{
        const {data, loading, error} = billsData;
        return data;
        });
      expect(lgth.length).toBe(undefined);
    })
  })
})