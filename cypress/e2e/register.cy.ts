describe('Registro de Usuarios', () => {
    beforeEach(() => {
        cy.visit('/registrarse');
    });

    it('Debería mostrar todos los campos del formulario de registro', () => {
        cy.contains('Registrarse').should('be.visible');
        cy.get('input[name="dni"]').should('be.visible');
        cy.get('input[name="name"]').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('input[name="confirmPassword"]').should('be.visible');
        cy.contains('Alcalde (Municipio)').should('be.visible');
        cy.contains('Gobernador (Departamento)').should('be.visible');
    });

    it('Debería completar el flujo de registro como Gobernador (Exitoso)', () => {
        // Interceptamos la carga de departamentos
        cy.intercept('GET', '**/geographic/departments*', {
            statusCode: 200,
            body: [
                { _id: 'dept-1', name: 'La Paz' },
                { _id: 'dept-2', name: 'Santa Cruz' }
            ]
        }).as('getDepartments');

        // Interceptamos la llamada de registro exitoso
        cy.intercept('POST', '**/auth/register', {
            statusCode: 201,
            body: { message: 'Usuario creado correctamente' }
        }).as('registerSuccess');

        cy.get('input[name="dni"]').type('12345678');
        cy.get('input[name="name"]').type('Nombre del Arquitecto');
        cy.get('input[name="email"]').type('test@ejemplo.com');
        cy.get('input[name="password"]').type('Admin12345');
        cy.get('input[name="confirmPassword"]').type('Admin12345');

        // Seleccionamos Rol Gobernador
        cy.contains('Gobernador (Departamento)').click();

        // Esperamos a que carguen los departamentos
        cy.wait('@getDepartments');

        // Seleccionamos el primer departamento que aparezca en el ScopePicker
        cy.contains('button', 'La Paz').click();

        // AHORA el botón debería estar habilitado
        cy.get('button[type="submit"]').should('not.be.disabled').click();

        cy.wait('@registerSuccess');
        cy.url().should('include', '/pendiente');
        cy.contains('Verifique su correo').should('exist');
    });

    it('Debería mostrar un modal de error si el correo ya existe (Mocking)', () => {
        cy.intercept('GET', '**/geographic/departments*', {
            statusCode: 200,
            body: [{ _id: 'dept-1', name: 'La Paz' }]
        }).as('getDepsError');

        cy.intercept('POST', '**/auth/register', {
            statusCode: 400,
            body: { message: 'El correo electrónico ya se encuentra registrado' }
        }).as('registerError');

        cy.get('input[name="dni"]').type('11223344');
        cy.get('input[name="name"]').type('Usuario Duplicado');
        cy.get('input[name="email"]').type('duplicado@test.com');
        cy.get('input[name="password"]').type('Password123!');
        cy.get('input[name="confirmPassword"]').type('Password123!');

        cy.contains('Gobernador (Departamento)').click();
        cy.wait('@getDepsError');
        cy.contains('button', 'La Paz').click();

        cy.get('button[type="submit"]').click();

        cy.wait('@registerError');
        cy.contains('Hubo un problema').should('be.visible');
        cy.contains('El correo electrónico ya se encuentra registrado').should('be.visible');
    });
});

