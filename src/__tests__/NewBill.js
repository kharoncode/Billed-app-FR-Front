/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH} from "../constants/routes.js";

import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })

    test("Then test",()=>{
      const title = screen.getByText("Envoyer une note de frais");
      expect(title).toBeTruthy();

      /* document.body.innerHTML = NewBillUI();
      const title = screen.getByText("Envoyer une note de frais");
      expect(title).toBeTruthy(); */
      //to-do write assertion
    })

    test("Then NewBill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
    })

    test("Then Justificatif should be empty if i send a file with a wrong extension",()=>{
      /* const mockJustificatif = new File(["test"], "test.pdf", { type: "text/pdf" }); */
      const mockJustificatif = new File(["hello"], "hello.png", { type: "image/png" });
      const file = screen.getByTestId("file");
      userEvent.upload(file, mockJustificatif);

      expect(mockJustificatif).toEqual("test2");
      expect(file.files[0]).toBe(mockJustificatif);
      expect(file.files[0]).toEqual("test");
    })

  })
})
