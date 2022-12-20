const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
require('dotenv').config();
const baseURL = process.env.BASEURL;

let input = {
    "ips": ["128.101.101.101", "85.25.43.84"]
};

chai.use(chaiHttp);
describe("Initial Test", function () {
    it('Server is running', function (done) {
        chai.request(baseURL)
            .get('/')
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('Get GeoLocation Data using IP Addresses', function (done) {
        chai.request(baseURL)
            .post('/getIPData')
            .send(input)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });
});