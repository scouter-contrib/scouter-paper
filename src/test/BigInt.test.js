import {IdAbbr} from "../common/idAbbr"
import bigInt from 'big-integer';
describe('HEX32.toString BigInter Test', () => {

    it('should return : toStringe32',() =>{
        expect(IdAbbr.abbr('-7451512163003069676')).toBe('z6eq8mqkdkpt7c');
        expect(IdAbbr.abbr('-9223372036854775808')).toBe('z8000000000000');
        expect(IdAbbr.abbr('792539709424970410')).toBe('xlvtalalalala');
        expect(IdAbbr.abbr('100000001')).toBe('x2vbo81');
    })

    it('should return : toLong32',() =>{
        expect(IdAbbr.toLong32('z6eq8mqkdkpt7c')).toBe('-7451512163003069676');
        expect(IdAbbr.toLong32('z8000000000000')).toBe('-9223372036854775808');
        expect(IdAbbr.toLong32('xlvtalalalala')).toBe('792539709424970410');
    })

});