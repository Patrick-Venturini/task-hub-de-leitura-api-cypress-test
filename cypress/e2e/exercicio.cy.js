/// <reference types="cypress" />
import { faker } from "@faker-js/faker"
describe('Testes da Funcionalidade Catálogo de Livros', () => {

     let token
     beforeEach(() => {
          cy.geraToken('admin@biblioteca.com', 'admin123').then(tkn => {
               token = tkn
          })
     });

     // Objetivo: Verificar que a API retorna lista de livros com paginação e filtros funcionando
     // Validar que filtros por categoria e autores funcionam corretamente
     it('GET - Deve listar livros com filtros e paginação', () => {
          let page = 1
          cy.api({
               method: 'GET',
               url: 'books',
               headers: { 'Authorization': token },
               qs: {
                    page: page,
                    limit: 10,
                    category: 'Fantasia',
                    author: 'J.R.R. Tolkien'

               }
          }).should(response => {
               expect(response.status).to.equal(200) //valida status
               expect(response.body.pagination.currentPage).to.equal(page)
               expect(response.body.books[0].category).to.equal('Fantasia')
               expect(response.body.books[0].author).to.equal('J.R.R. Tolkien')
          })
     });

     // Objetivo: Validar que é possível obter detalhes de um livro específico pelo ID
     // Verificar que todos os campos do livro são retornados corretamente
     it('GET - Deve obter detalhes de um livro específico', () => {
          cy.api({
               method: 'GET',
               url: 'books/10',
               headers: { 'Authorization': token },
          }).should(response => {
               expect(response.status).to.equal(200)
               expect(response.body.book.title).to.equal("Harry Potter e a Pedra Filosofal")
               expect(response.body.book.author).to.equal("J.K. Rowling")
               expect(response.body.book.category).to.equal("Fantasia")
               expect(response.body.book.description).to.equal("O primeiro livro da saga Harry Potter apresenta o jovem bruxo que descobre seu passado mágico e embarca em aventuras na Escola de Magia de Hogwarts. Um clássico moderno da literatura infantojuvenil.")
          })
     });

     // Objetivo: Validar que um novo livro é adicionado com sucesso ao catálogo
     // Verificar que apenas admin pode adicionar novos livros (validação de permissão)
     it('POST - Deve cadastrar um novo livro com sucesso', () => {
          let livro = `livro${Date.now()}`

          cy.api({
               method: 'POST',
               url: 'books',
               headers: { 'Authorization': token },
               body: {
                    title: livro,
                    author: "Aluísio Azevedo",
                    description: "Romance naturalista que retrata a vida em um cortiço",
                    category: "Literatura Brasileira",
                    isbn: "978-85-260-1320-6",
                    editor: "Editora Ática",
                    language: "Português",
                    publication_year: 1890,
                    pages: 312,
                    format: "Físico",
                    total_copies: 4,
                    available_copies: 4
               }
          }).should(response => {
               expect(response.status).to.equal(201)
               expect(response.body.message).to.equal("Livro criado com sucesso.")
          })
     });

     // Objetivo: Garantir que dados inválidos são rejeitados ao adicionar um livro
     // Validar mensagens de erro apropriadas para dados faltantes ou incorretos
     it('POST -  Deve rejeitar livro com dados inválidos', () => {
          cy.api({
               method: 'POST',
               url: 'books',
               headers: { 'Authorization': token },
               body: {
                    title: "",
                    author: "Aluísio Azevedo",
                    description: "Romance naturalista que retrata a vida em um cortiço",
                    category: "Literatura Brasileira",
                    isbn: "978-85-260-1320-6",
                    editor: "Editora Ática",
                    language: "Português",
                    publication_year: 1890,
                    pages: 312,
                    format: "Físico",
                    total_copies: 4,
                    available_copies: 4
               },
               failOnStatusCode: false
          }).should(response => {
               expect(response.status).to.equal(400)
               expect(response.body.message).to.equal('"title" is not allowed to be empty')
          })
     });

     // Objetivo: Validar que um livro pode ser atualizado com sucesso
     // Verificar que apenas admin pode atualizar livros (validação de permissão)
     it('PUT - Deve atualizar um livro previamente cadastrado', () => {
          let title = faker.book.title()
          let author = faker.book.author()

          cy.cadastrarLivro(title, author, token).then(bookId => {
               cy.api({
                    method: 'PUT',
                    url: `books/${bookId}`,
                    headers: { 'Authorization': token },
                    body: {
                         title: `${title} atualizado`,
                         author: author
                    }
               }).should(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal("Livro atualizado com sucesso.")
               })
          })
     });

     // Objetivo: Validar que um livro pode ser removido do catálogo
     // Verificar que apenas admin pode deletar livros (validação de permissão)
     it.only('DELETE - Deve deletar um livro previamente cadastrado', () => {
          let title = faker.book.title()
          let author = faker.book.author()

          cy.cadastrarLivro(title, author, token).then(bookId => {
               cy.api({
                    method: 'DELETE',
                    url: `books/${bookId}`,
                    headers: { 'Authorization': token }
               }).should(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal("Livro deletado com sucesso.")
               })
          })
     });
});
