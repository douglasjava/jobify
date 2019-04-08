const express = require('express')
const app = express()
const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })
const bodyParser = require('body-parser')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async (request, response) => {
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias')
    const vagas = await db.all('select * from vagas')
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter( vaga => vaga.categoria === cat.id )
        }
    })
    response.render('home', {
        categorias,
        vagas
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/vaga/:id', async (request, response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = ' + request.params.id)
    response.render('vaga', {vaga})
})

app.get('/admin/vagas', async (req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas', { vagas })
})

app.get('/admin/vagas/nova', async (req, res) => {
    res.render('admin/nova-vaga')
})

app.post('/admin/vagas/nova', async (req, res) => {
    const { titulo,  descricao, categoria } = req.body
    const db = await dbConnection
    await db.run(`insert into vagas (categoria, titulo, descricao) values('${categoria}', '${titulo}', '${descricao}') `)
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/delete/:id', async (req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+ req.params.id)
    res.redirect('/admin/vagas')
})

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT) ')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT) ')
    // const categoria = 'Enginnering team'
    // const categoria = 'Marketing team'
    // await db.run(`insert into categorias (categoria) values('${categoria}') `)
    // const vaga = 'Enginnering SoftWare (Dublin)'
    // const descricao = 'Vaga para Enginnering for Java Team Leader'
    // await db.run(`insert into vagas (categoria, titulo, descricao) values(2, '${vaga}', '${descricao}') `)
}

init()
app.listen(3000, (err) => {
    if(err){
        console.log('Não foi possivel iniciar o servidor Jobify.')
    }else {
        console.log('Servidor Jobify rodando...')
    }
})