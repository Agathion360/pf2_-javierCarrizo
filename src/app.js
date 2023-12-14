import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import productRouter from './dao/routes/products.routes.js';
import carts from './dao/routes/carts.routes.js';
import Carts from './dao/models/carts.models.js';
import path from 'path';
import { __dirname } from './path.js';
import { Server } from 'socket.io';
import productsModel from './dao/models/products.model.js';
import viewRouter from './dao/routes/products.views.routes.js';
import cartViews from './dao/routes/carts.views.routes.js';
import chatRouter from './dao/routes/chat.routes.js';
import ChatMessage from './dao/models/chat.models.js';


const chat_messages = []
const PORT = 8080;
const MONGOOSE = 'mongodb+srv://carrizo38:Parana149@cluster0.z2rdlx9.mongodb.net/ecomerce'

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));


app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')


app.use('/', viewRouter)
app.use('/', cartViews)
app.use('/', chatRouter)


app.use('/api/carts',carts)
app.use('/api/products', productRouter)




try{
    await mongoose.connect(MONGOOSE)
    
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    });
 
    const io = new Server(server);
 
    io.on('connection', socket => {
        console.log('Conexión con Socket.io');


        const itemsPerPage = 10;
        socket.on('load', async ({ page }) => {
            try {
              const options = {
                limit: itemsPerPage,
                page,
                lean: true,
              };
        
              const products = await productsModel.paginate({}, options);
              const totalPages = Math.ceil(products.total / itemsPerPage);
        
              socket.emit('products', { products: products.docs, totalPages });
            } catch (error) {
              console.error('Error al obtener productos paginados:', error);
              socket.emit('error', { message: 'Error al obtener productos paginados' });
            }
          });
        
        
        socket.on('pageChanged', async newPage => {
            try {
                const options = {
                    limit: itemsPerPage,
                    page: newPage,
                    lean: true
                };
        
                const products = await productsModel.paginate({}, options);
                io.emit('products', products);
            } catch (error) {
                console.error('Error al obtener productos paginados:', error);
            }
        });
        






        socket.on('carts', async () => {
            const carts = await Carts.find();
            socket.emit('carts', carts);
        });

        socket.on('message', data => {
            chat_messages.push(data)
            io.emit('messageLogs', chat_messages)
        });
        socket.on('message', async data => {
            const chatMessage = new ChatMessage(data);
            await chatMessage.save();        
            socket.broadcast.emit('newMessage', data);

        });

        socket.on('addToCart', async data => {
            if (data.product) {
                cart.push(data.product);
                io.emit('cartUpdated', cart);
            } else if (data.productId) {
                const product = await controller.getProductById(data.productId);
                if (!product.error) {
                    cart.push(product);
                    io.emit('cartUpdated', cart);
                }
            }
        });
        
   

        
        
    });
 
 }catch(error){
     console.error("Error al conectar a la base de datos:", error.message)
}

app.get('*', (req, res) => {
    res.status(400).send(`<h1 style="color:red">Pagina no encontrada</h1>`)
});





app.get('*', (req, res) => {
    res.status(400).send(`<h1 style="color:red">Pagina no encontrada</h1>`)
});
