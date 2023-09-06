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
        type: 'Employee',
        email: 'e@e'
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

    test("Then Justificatif should be empty if we send a file with a wrong extension", ()=>{
      const mockfile = new File(["test"], "test.pdf", { type: "application/pdf" });
      const input = screen.getByTestId("file");
      userEvent.upload(input, mockfile);
      expect(input.files).toBeNull();
    })

    test("Then error message should disapear if we send a file with a right extension", async ()=>{
      const mockfilePDF = new File(["test"], "test.pdf", { type: "application/pdf" });
      const mockfilePNG = new File(["hello"], "hello.png", { type: "image/png" });
      const input = screen.getByTestId("file");
      userEvent.upload(input, mockfilePDF);
      await waitFor(()=> screen.getByTestId('icon-error'));
      let iconError = document.querySelector('.iconError');
      expect(iconError).not.toBeNull();
      userEvent.upload(input, mockfilePNG);
      iconError = document.querySelector('.iconError');
      expect(iconError).toBeNull();
    })

    test("Then Justificatif should not be empty if we send a file with a right extension", ()=>{
      const mockfile = new File(["hello"], "hello.png", { type: "image/png" });
      const input = screen.getByTestId("file");
      userEvent.upload(input, mockfile);
      expect(input.files).not.toBeNull();
    })

    test("Then Validate Submit should return to the Bills page",async ()=>{
      await waitFor(()=> screen.getByTestId("btn-send-bill"));
      /* screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Vol Test";
      screen.getByTestId("datepicker").value = "1985-12-05";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("vat").value = 50;
      screen.getByTestId("pct").value = 20;
      screen.getByTestId("commentary").value = "Comment Test"; */

      userEvent.selectOptions(screen.getByTestId("expense-type"), "Transports");
      userEvent.type(screen.getByTestId("expense-name"), 'Vol Test');
      userEvent.type(screen.getByTestId("datepicker"), "1985-12-05");
      userEvent.type(screen.getByTestId("amount"), "100");
      userEvent.type(screen.getByTestId("vat"), "50");
      userEvent.type(screen.getByTestId("pct"), "20");
      userEvent.type(screen.getByTestId("commentary"), "Comment Test");


      /* const mockfile = new File(["hello"], "hello.png", { type: "image/png" });
      const input = screen.getByTestId("file");
      userEvent.upload(input, mockfile); */
      /* input.value = `C:\fakepath\hello.png`; */
      /* const submit = screen.getByTestId("form-new-bill") */;
      /* userEvent.click(screen.getByTestId("btn-send-bill"));
      await waitFor(()=> screen.getByText('Envoyer une note de frais'));
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy(); */

      expect(screen.getByTestId("datepicker").value).toContain("test")
    })

  })
})
