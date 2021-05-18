import crypto from 'crypto'
import GpWebpayOperation from './GPWebpay'

interface GpWebpayResponseData {
  OPERATION: GpWebpayOperation
  ORDERNUMBER: string
  MERORDERNUM?: string
  MD?: string
  PRCODE: string
  SRCODE: string
  RESULTTEXT?: string
  USERPARAM1?: string
  ADDINFO?: string
  TOKEN?: string
  EXPIRY?: string
  ACSRES?: string
  ACCODE?: string
  PANPATTERN?: string
  DAYTOCAPTURE?: string
  TOKENREGSTATUS?: string
  ACRC?: string
  RRN?: string
  PAR?: string
  TRACEID?: string
  DIGEST: string
  DIGEST1: string
}

class GpWebpayResponse {
  private data: GpWebpayResponseData
  merchantNumber: string
  publicKey: string | Record<string, unknown> | Buffer | crypto.KeyObject

  constructor(
    merchantNumber: string,
    data: GpWebpayResponseData,
    publicKey: string | Record<string, unknown> | Buffer | crypto.KeyObject,
    validate = true
  ) {
    this.data = data
    this.merchantNumber = merchantNumber
    this.publicKey = publicKey

    if (validate && !this.validateSignature()) {
      throw new Error('Response is not valid.')
    }
  }

  getOperation(): GpWebpayOperation {
    return this.data.OPERATION
  }

  getOrderNumber(): string {
    return this.data.ORDERNUMBER
  }

  getDigest(): string {
    return this.data.DIGEST
  }

  getDigest1(): string {
    return this.data.DIGEST1
  }

  getPrCode(): string {
    return this.data.PRCODE
  }

  getSrCode(): string {
    return this.data.SRCODE
  }

  getResultText(): string | undefined {
    return this.data.RESULTTEXT
  }

  getSignatureBase(): string {
    const signKeys = [
      'OPERATION',
      'ORDERNUMBER',
      'MERORDERNUM',
      'MD',
      'PRCODE',
      'SRCODE',
      'RESULTTEXT',
      'USERPARAM1',
      'ADDINFO'
    ]

    const base = []
    const values = Object.values(this.data)
    const keys = Object.keys(this.data)
    for (const key of signKeys) {
      const i = keys.indexOf(key)
      if (i >= 0) {
        base.push(values[i])
      }
    }

    return base.join('|')
  }

  validateSignature(): boolean {
    const digestBase = this.getSignatureBase()
    const digest1Base = digestBase + '|' + this.merchantNumber

    const verify = crypto.createVerify('sha1')
    verify.update(digestBase)
    const valid = verify.verify(this.publicKey, this.getDigest(), 'base64')

    if (!valid) {
      return false
    }

    const verify1 = crypto.createVerify('sha1')
    verify1.update(digest1Base)
    const valid1 = verify1.verify(this.publicKey, this.getDigest1(), 'base64')

    return valid1
  }
}

export default GpWebpayResponse
export { GpWebpayResponseData }
