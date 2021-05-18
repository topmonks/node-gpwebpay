import GpWebpayRequest from './GpWebpayRequest'
import GpWebpayResponse, { GpWebpayResponseData } from './GpWebpayResponse'

enum GpWebpayOperation {
  CREATE_ORDER = 'CREATE_ORDER'
}

class GpWebpay {
  merchantNumber: string
  gatewayUrl: string
  privateKeyPass: string

  private publicKey: string
  private privateKey: string

  constructor(
    merchantNumber: string,
    gatewayUrl: string,
    privateKey: string,
    privateKeyPass: string,
    publicKey: string
  ) {
    this.merchantNumber = merchantNumber
    this.gatewayUrl = gatewayUrl
    this.privateKey = privateKey
    this.privateKeyPass = privateKeyPass
    this.publicKey = publicKey
  }

  getRequestUrl(request: GpWebpayRequest): string {
    request.merchantNumber = this.merchantNumber
    request.validateProperties()
    const privateKey = this.getPrivateKey()
    request.sign(privateKey, this.privateKeyPass)

    const postData = request.getPostData()

    return this.gatewayUrl + '?' + postData
  }

  parseQueryString(str: string): any {
    const data: any = {}
    const items = str.split('&')
    for (const item of items) {
      const itemData = item.split('=')
      data[itemData[0]] = decodeURIComponent(itemData[1])
    }

    return data
  }

  getPrivateKey(): string {
    return this.privateKey
  }

  getPublicKey(): string {
    return this.publicKey
  }

  createResponse(
    data: GpWebpayResponseData,
    validate = true
  ): GpWebpayResponse {
    const publicKey = this.getPublicKey()
    return new GpWebpayResponse(this.merchantNumber, data, publicKey, validate)
  }
}

export default GpWebpay
export { GpWebpayOperation }
