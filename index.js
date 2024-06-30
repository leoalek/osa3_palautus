require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

const morgan = require('morgan')
const cors = require('cors')


app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
morgan.token('body',function(req,res){
    return JSON.stringify(req.body)
})

let persons = [
    {
        id:1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id:2,
        name: "Ada Lovelace",
        number: "39-44-5322523"
    },
    {
        id:3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id:4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
] 


app.use(morgan('tiny',{
    skip: function(req,res) {return req.method === 'POST'}
}))
app.use(morgan(
    'method: :url :status :res[content-length] - :response-time ms :body',{
    skip: function(req,res) {return req.method !== 'POST'}
}))


app.get('/',(request,response) => {
    Person.find({}).then(persons =>{
        response.end()
    })
})


app.get('/api/persons',(request,response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info',(request,response) =>{
    const total = persons.length
    const date = Date()
    response.send(
        `
        <p>Phonebook has info for ${total} people</p>
        <p>${date}</p>
        `
    )
})

app.get('/api/persons/:id',(request,response) =>{
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
})

//delete person
app.delete('/api/persons/:id',(request,response,next) =>{
    Person.findByIdAndDelete(request.params.id).then(result =>{
       response.status(204).end() 
    }).catch(error => next(error))
})

// random number generator (for id)
const rndNewId = (min,max) =>{
    return Math.floor(Math.random()*max-min)+min
}

app.post('/api/persons',(request,response) =>{
    const body = request.body

    if(body.name === undefined){
        return response.status(400).json({
            error: 'name missing'
        })
    }else if(body.number === undefined){
        return response.status(400).json({
            error: 'number missing'
        })
    }
    const person = new Person ({
        name: body.name,
        number: body.number
    })
    person.save().then(savedPerson =>{
        response.json(savedPerson)
    })
})



const PORT = process.env.PORT
app.listen(PORT,() => {
    console.log(`server running on port ${PORT}`)
})