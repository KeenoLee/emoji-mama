import * as redis from 'redis'

//得get同set！
let client = redis.createClient({
    url: 'redis://127.0.0.1:6379'
})

async function main() {
    await client.connect()
client.get('price').then(value=>{console.log(value)}).catch(e=>{console.error(e)})

    await client.disconnect();
}
// client.get('price').then(value=>{console.log(value)}).catch(e=>{console.error(e)})

// async function main() {
//     await client.connect();
//     client.set('price', 100)
//     console.log(await client.get('price'))
//     await client.disconnect();
// }
main()