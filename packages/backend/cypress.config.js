import { clerkSetup } from '@clerk/testing/cypress'
import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    test_user: 'isanna@frba.utn.edu.ar',
    test_password: 'añesartnoc321',
    CLERK_SECRET_KEY: 'la_clave_secreta',
    CLERK_PUBLISHABLE_KEY: 'la_clave_publicable',
  },
  e2e: {
    setupNodeEvents(on, config) {
      return clerkSetup({ config })
    },
    baseUrl: 'http://localhost:3001',
    specPattern: 'test/e2e/**/*.cy.js',
    supportFile: 'test/e2e/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    defaultCommandTimeout: 8000
  }
})
