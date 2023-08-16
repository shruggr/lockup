import { Lockup } from '../../src/contracts/lockup'
import { getDefaultSigner, randomPrivateKey } from '../utils/txHelper'
import { Ripemd160 } from 'scrypt-ts'

async function main() {
    const [priv, pub, pkhash] = randomPrivateKey()
    await Lockup.compile()

    // create a genesis instance
    const lockup = new Lockup(Ripemd160(pkhash.toString('hex')), 1600000n)

    // connect to a signer
    await lockup.connect(getDefaultSigner(priv))

    // contract deployment
    const deployTx = await lockup.deploy(10000)
    console.log('Deploy Txid: ', deployTx.id)
}

describe('Test SmartContract `Counter` on testnet', () => {
    it('should succeed', async () => {
        await main()
    })
})
