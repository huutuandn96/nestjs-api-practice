import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from 'pactum';

const PORT = 3002
describe('App EndToEnd tests', () => {
  let app: INestApplication
  let prismaService: PrismaService
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = appModule.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
    await app.listen(PORT)
    prismaService = app.get(PrismaService)
    await prismaService.cleanDatabase()
    pactum.request.setBaseUrl(`http://localhost:${PORT}`)
  })

  describe('Test Authentication', () => {
    describe('Register', () => {
      it('should register successfully', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: 'testemail@example.com',
            password: '123456'
          })
          .expectStatus(201)
        // .inspect()
      })
      it('should show error with wrong format email', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: 'abc',
            password: '123456'
          })
          .expectStatus(400)
      })
      it('should show error with empty email', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: '',
            password: '123456'
          })
          .expectStatus(400)
      })
      it('should show error with empty password', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody({
            email: 'testemail@example.com',
            password: ''
          })
          .expectStatus(400)
      })
    })

    describe('Login', () => {
      it('should login successfully', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody({
            email: 'testemail@example.com',
            password: '123456'
          })
          .expectStatus(201)
          .stores('accessToken', "accessToken")
      })

      it('should login failed', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody({
            email: 'testemail@example.com',
            password: '126'
          })
          .expectStatus(403)
      })
    })

    describe('Get detail user', () => {
      it('should get user info successfully', () => {
        return pactum.spec()
          .get('/users/me')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200)
      })
    })
  })

  describe('Note', () => {
    describe('Insert Note', () => {
      it('insert first note successfully', () => {
        return pactum.spec()
          .post('/notes')
          .withBearerToken('$S{accessToken}')
          .withBody({
            title: 'Title 1',
            description: 'Description 1',
            url: 'example1.com'
          })
          .expectStatus(201)
          .stores('noteId01', 'id')
      })

      it('insert second note successfully', () => {
        return pactum.spec()
          .post('/notes')
          .withBearerToken('$S{accessToken}')
          .withBody({
            title: 'Title 2',
            description: 'Description 2',
            url: 'example2.com'
          })
          .expectStatus(201)
          .stores('noteId02', 'id')
      })
    })

    describe('Get Note Detail', () => {
      it('get first note detail', () => {
        return pactum.spec()
          .get('/notes/{note_id}')
          .withBearerToken('$S{accessToken}')
          .withPathParams('note_id', '$S{noteId01}')
          .expectStatus(200)
      })

      it('get note detail failed', () => {
        return pactum.spec()
          .get('/notes/{note_id}')
          .withBearerToken('$S{accessToken}')
          .withPathParams('note_id', 0)
          .expectStatus(404)
      })
    })

    describe('Get List Notes', () => {
      it('Get list successfully', () => {
        return pactum.spec()
          .get('/notes')
          .withBearerToken('$S{accessToken}')
          .expectStatus(200)
      })
    })

    describe('Delete Note', () => {
      it('Delete successfully', () => {
        return pactum.spec()
          .delete('/notes')
          .withBearerToken('$S{accessToken}')
          .withQueryParams('id', '$S{noteId02}')
          .expectStatus(204)
      })
    })
  })

  afterAll(async () => {
    app.close()
  })
  it.todo('should PASS, haha');
})
