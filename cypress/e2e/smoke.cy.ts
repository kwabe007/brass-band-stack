describe("smoke tests", () => {

  it("should return a non-fail status code", () => {
    cy.request('/');
  });
});
