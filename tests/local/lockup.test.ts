import { expect, use } from 'chai'
import { Lockup } from '../../src/contracts/lockup'
import {
    getDummySigner,
    getDummyUTXO,
    randomPrivateKey,
} from '../utils/txHelper'
import { MethodCallOptions, Ripemd160, findSig } from 'scrypt-ts'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)
const [priv, pub, pkhash] = randomPrivateKey()
describe('Test SmartContract `Lockup`', () => {
    before(async () => {
        await Lockup.compile()
    })

    it('should pass the redeem method if signed after blockHeight.', async () => {
        const lockup = new Lockup(Ripemd160(pkhash.toString('hex')), 800000n)
        await lockup.connect(getDummySigner(priv))
        const resp = await lockup.deploy(10)
        console.log('Deploy Txid: ', resp.id)

        const { tx: callTx, atInputIndex } = await lockup.methods.redeem(
            (sigResps) => findSig(sigResps, pub),
            pub.toHex(),
            {
                pubKeyOrAddrToSign: pub,
                fromUTXO: getDummyUTXO(1),
                lockTime: 800001,
            } as MethodCallOptions<Lockup>
        )

        const result = callTx.verifyScript(atInputIndex)

        expect(result.success, result.error).to.be.true
    })

    it('should fail the redeem method if signed before blockHeight.', async () => {
        const lockup = new Lockup(Ripemd160(pkhash.toString('hex')), 800000n)
        await lockup.connect(getDummySigner(priv))
        const resp = await lockup.deploy(10)
        console.log('Deploy Txid: ', resp.id)

        return expect(
            lockup.methods.redeem(
                (sigResps) => findSig(sigResps, pub),
                pub.toHex(),
                {
                    pubKeyOrAddrToSign: pub,
                    fromUTXO: getDummyUTXO(1),
                    lockTime: 799999,
                } as MethodCallOptions<Lockup>
            )
        ).to.be.rejectedWith('lockUntilHeight not reached')
    })
})
