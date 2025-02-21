const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const bodyParser = require('body-parser');
const { connectDb } = require('./connectDb');
const { authenticateToken } = require('./middlewares/authentication');
const LoginSignup = require('./routes/LoginSignup');
const referralRoutes = require('./routes/referral');
const cmsRoutes = require('./routes/cms');
const gameRoutes = require('./routes/gameAndEarning');
require('dotenv').config();

const app = express();
const port = 3000;

connectDb(process.env.MONGODB_URI);

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Customer API',
            description: 'Customer API Information',
            contact: {
                name: 'Amazing Developer',
            },
            servers: [`http://localhost:${port}`],
        },
    },
    apis: ['./src/routes/*.js'],
};

const corsOptions = {
    origin: 'http://localhost:',
    optionsSuccessStatus: 200,
    withCredentials: true,
};



const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', LoginSignup);
app.use('/referral', authenticateToken, referralRoutes);
app.use('/cms', authenticateToken, cmsRoutes);
app.use('/game', authenticateToken, gameRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
