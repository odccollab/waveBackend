import { createClient } from 'redis';

const client = createClient({
    password: 'O3NBVXyY9NprIBchKhfDwk6VcFmTt5On',
    socket: {
        host: 'redis-13425.c100.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 13425
    }
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

client.connect()
    .then(() => console.log('Connected to Redis Cloud'))
    .catch((err) => console.error('Failed to connect to Redis Cloud:', err));

export default client;
