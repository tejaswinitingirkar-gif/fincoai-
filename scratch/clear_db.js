const { MongoClient } = require('mongodb');

async function run() {
    const uri = 'mongodb://127.0.0.1:27017/finco_db';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = await client.db().collection('users').updateMany(
            {}, 
            { $unset: { faceEmbeddings: 1 }, $set: { faceRecognitionEnabled: false } }
        );
        console.log("Cleared face embeddings:", result);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
        process.exit();
    }
}
run();
