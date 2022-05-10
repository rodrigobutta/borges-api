import chai from 'chai';
import settings from '../src/settings';
import { getApiUrl } from '../src/lib/url';

chai.use(require('chai-json'));
chai.use(require('chai-http'));

const should = chai.should();
const expect = chai.expect;

const API_URL = getApiUrl(); // "http://localhost:5002"; // don't put final bar here

console.log('API_URL', API_URL);

describe('Main Service Availability', function () {
	it('Returns a 200 code', () => {
		return chai
			.request(API_URL)
			.get('/')
			.then((res) => res.should.have.status(200));
	});

	it('Returns a JSON response code', () => {
		return chai
			.request(API_URL)
			.get('/')
			.set('Content-Type', 'application/json')
			.then((res) => res.should.be.json);
	});

	it('Returns expected service availability response', () => {
		return chai
			.request(API_URL)
			.get('/')
			.set('Content-Type', 'application/json')
			.then(
				(res) => res.body.should.have.property('test').eql('OK')
				//     res.body.errors.pages.should.have.property('kind').eql('required')
				//     res.body.should.have.property('test').that.includes.all.keys(['OK'])
			);
	});
});
