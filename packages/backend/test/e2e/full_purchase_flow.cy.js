describe('Full purchase flow: login -> create product -> buy -> cancel -> delete', () => {
  const email = 'isanna@frba.utn.edu.ar';
  const password = 'añesartnoc321';
  const title = '27379a3988da1d27679781c3a252f30d';
  const description = 'Descripción';
  const precio = '2000';
  const moneda = 'Peso Argentino';
  const stock = '2';
  const categoria = 'Accesorios';
  const imagenUrl = 'https://imgs.search.brave.com/YMuWYB62CWIegioNvwWfcxeWfeLscQBTl9fQP_q7e6o/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zZW5z/YXRpb25kdXRlbXBz/LmNvbS9jZG4vc2hv/cC9maWxlcy9yb2xl/eC13YXRjaGVzLXNl/YS1kd2VsbGVyXzgw/MHgud2VicD92PTE3/NDcyNDU4OTQ';

  it('performs the user flow in the live frontend', () => {
    const testUser = Cypress.env('test_user') || Cypress.env('TEST_USER') || email;
    const testPassword = Cypress.env('test_password') || Cypress.env('TEST_PASSWORD') || password;

    cy.visit('http://localhost:3001');

    cy.clerkLoaded();
    cy.clerkSignIn({ strategy: 'password', identifier: testUser, password: testPassword });

    cy.visit('http://localhost:3001/home');

    cy.url({timeout: 20000}).should('include','/home');
    cy.contains('PANEL DE VENDEDOR').click();

    cy.url().should('include','/seller');
    cy.get('[aria-label="mis productos"]').click();

    cy.contains('Agregar producto').click();

    cy.get('div[role="dialog"]').within(() => {

      cy.get('label').contains('Título').parent().find('input').type(title);

      cy.get('label').contains('Descripción').parent().find('input').type(description);

      cy.get('label').contains('Precio').parent().find('input').clear().type(precio);

      cy.get('label').contains('Stock').parent().find('input').clear().type(stock);

      cy.get('label').contains('Categoría').parent().click();
      cy.document().then((doc) => {
        cy.wrap(doc.body)
          .contains('li[role="option"]', categoria)
          .click();
      });
      
      cy.get('label').contains('URL de imágenes').parent().find('input').type(imagenUrl);

      cy.contains('Guardar').click();
    });

    cy.get('input[placeholder="Buscar productos, marcas y más..."]').should('be.visible').clear().type(title+'{enter}');

    cy.url().should('contain', `products?search=${title}`);
    cy.contains(title).should('be.visible');
    cy.get('.MuiCard-root').should('have.length', 1).first().contains('button', 'Agregar al carrito').click();

    cy.get('[aria-label="Ver carrito"]').click();
    cy.url().should('include','/carrito');

    cy.contains('Comprar').click();
    cy.contains('Ir a checkout').click();

    cy.url().should('include','/checkout');

    cy.get('input[name="altura"]').type('2500');
    cy.get('input[name="provincia"]').type('CABA');
    cy.get('input[name="pais"]').type('Argentina');

    cy.on('window:alert', (text) => {
      expect(text).to.include('Pedido realizado con éxito');
    });

    cy.contains('Finalizar compra').click();

    cy.url({timeout:20000}).should('include','/home');

    cy.contains('PANEL DE VENDEDOR').click();
    cy.url().should('include','/seller');
    cy.get('[aria-label="mis productos"]').click();
    cy.get('.MuiCard-root').should('have.length', 1).first()
    cy.contains('Stock: 19').should('be.visible');

    cy.get('[aria-label="administrar pedidos"]').click();

    cy.get('[aria-label="Listado de pedidos del vendedor"]', { timeout: 20000 })
      .should('exist')
      .within(() => {
        cy.contains('Cancelar').first().click();
      });
    cy.contains('Pedidos de Clientes').should('be.visible');

    cy.get('[aria-label="mis productos"]').click();
    cy.get('.MuiCard-root').should('have.length', 1).first()
    cy.contains('Stock: 20').should('be.visible');
    cy.contains('Eliminar').click();

    cy.on('window:confirm', (text) => {
      // interceptor for confirm()
      expect(text).to.match(/Estás seguro/);
      return true;
    });

    cy.contains(title).should('not.exist');
  });
});
