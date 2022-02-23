const { response } = require('express');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

var mysql = require('mysql');

//define mysql connection
//var connection = mysql.createConnection({
//  host     : 'localhost',
//  user     : 'root',
//  password : 'password',
//  database : 'bookie_sloth',
//  insecureAuth : true
//});

var connection = mysql.createConnection({
  host     : '10.70.70.120',
  user     : 'lorenzo',
  password : 'DOCKERMYSQL',
  database : 'bookie_sloth',
  insecureAuth : true
});




//check connection
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//define the model of the apartments
var ApartmentsSchema = buildSchema(`
  type Query {
    #get all apartments
    apartments:ApartmentsList
    #search apartment by ID
    apartmentShow(id:Int!):Apartment
  }
  type Apartment {
    id: Int
    name: String    
    n_guests: Int  
    n_rooms: Int
    n_bathrooms: Int
    size: Float
    price: Float    
    x_coordinate: Float  
    y_coordinate: Float
    cover_img: String
    visible: Boolean
    address: String       
    location: String
    cap: String
  }
  type ApartmentsList {
    items: [Apartment]
  }
`);





/**
 * @description execute a query as promise
 * @returns {Object} data of single apartment
 */
async function exec(queryString) {
    try {
      return new Promise((resolve, reject) => {
        connection.query(queryString, (err, response, fields) => {
          return err ? reject(err) : resolve(response)
        })
      })
    } catch (err) {
      console.log(err)
      throw new Exception(err)
    }
}




var root = { 
   /**
   * @param {Int} args apartment ID 
   * @returns {Array} objects array containing all apartment data
   * @description handles the apartment list query
   */
  apartments: async () => {
    const queryString = 'SELECT * FROM apartments WHERE id IS NOT NULL'

    const data = await exec(queryString)

    console.log(data);

    return { items: data };
  },
  /**
   * @param {Int} args apartment ID 
   * @returns {Object} data of a single apartment
   * @description handles an apartment show query
   */
  apartmentShow: async (args) => {
    //get param id
    const id = args.id

    const queryString = 'SELECT * FROM apartments WHERE id = ' + id
    

    //if promise resolved contains aps data else contains error
    const data = await exec(queryString)

    return data[0]
  }
 };


var app = express()



app.use('/graphql', graphqlHTTP({
  //this is the model
  schema: ApartmentsSchema,
  rootValue: root,
  graphiql: true,
}));


app.listen(4000, () => console.log('listening on http://127.0.0.1:4000/graphql'));