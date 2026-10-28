import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateEnquiry,validateUpdate,csvCell} from '../lib/domain.ts';
const valid={id:'c3f4ee66-7189-484a-a165-9b1c08bb43db',name:'Test Customer',phone:'+27 710000000',email:'TEST@example.com',area:'Test area',description:'A fictional test issue.',service:'Appliance repair',consent:true};
test('valid enquiry normalises email',()=>assert.equal(validateEnquiry(valid).email,'test@example.com'));
for(const [key,value] of Object.entries({id:'bad',name:'x',phone:'javascript:abc',email:'bad',description:'short',service:'Unknown',consent:false,website:'spam'}))test('rejects invalid '+key,()=>assert.throws(()=>validateEnquiry({...valid,[key]:value})));
test('rejects oversized customer input',()=>assert.throws(()=>validateEnquiry({...valid,description:'a'.repeat(2001)})));
test('requires version and valid update',()=>{for(const input of [{version:0,status:'New'},{version:1,status:'Invalid'},{version:1},{version:1,note:' '}])assert.throws(()=>validateUpdate(input));assert.equal(validateUpdate({version:2,note:' Called '}).note,'Called')});
test('CSV neutralises spreadsheet formulas and quotes',()=>{assert.equal(csvCell('=1+1'),'"\'=1+1"');assert.equal(csvCell(' +SUM(A1)'),'"\' +SUM(A1)"');assert.equal(csvCell('a"b'),'"a""b"')});
