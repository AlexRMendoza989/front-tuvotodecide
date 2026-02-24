describe('Autenticación', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('Debería mostrar el formulario de login correctamente', () => {
        cy.contains('Iniciar Sesión').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    it('Debería mostrar un error con credenciales incorrectas', () => {
        cy.get('input[name="email"]').type('usuario@incorrecto.com');
        cy.get('input[name="password"]').type('123456');
        cy.get('button[type="submit"]').click();

        // Verificamos que aparezca algún mensaje de error
        // Ajusta el texto según los mensajes de tu backend
        cy.get('.text-red-500', { timeout: 10000 }).should('exist');
    });
});
