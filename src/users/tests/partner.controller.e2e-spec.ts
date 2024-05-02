import faker from 'faker';
import { TestHelper } from '~core/tests/test.helper';
import { FacilityTestHelper } from '~facilities/tests/facility-test.helper';
import { ProductDefinitionRepository } from '~product-definitions/repositories/product-definition.repository';
import { UserRoleEnum } from '~role-permissions/enums/user-role.enum';
import { SupplyChainTestHelper } from '~supply-chains/tests/supply-chain-test.helper';
import { UserTestHelper } from '~users/tests/user-test.helper';

describe('PartnerController (e2e)', () => {
    let testHelper = new TestHelper();
    let userTestHelper = testHelper.getTestHelperModule(UserTestHelper);
    let facilityTestHelper = testHelper.getTestHelperModule(FacilityTestHelper);
    let supplyChainTestHelper = testHelper.getTestHelperModule(SupplyChainTestHelper);
    let spinnerFacility;
    let spinnerToken;
    let ginnerToken;
    let ginnerFacility;
    let millFacility;
    let millToken;

    beforeAll(async () => {
        await testHelper.initialize();

        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);

        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerToken = await userTestHelper.getToken(ginner);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);

        const mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        millToken = await userTestHelper.getToken(mill);
        millFacility = await facilityTestHelper.create(mill, UserRoleEnum.MILL);
    });

    afterAll(async () => {
        await testHelper.close();
    });

    it('Spinner gets sellers', async () => {
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);
        const productDefinition = await ProductDefinitionRepository.make().createOne({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            roleId: spinner.roleId,
            fromRoleId: ginner.roleId,
            outputProductDefinitionId: productDefinition.id
        });

        await facilityTestHelper.addPartner(spinnerFacility, ginnerFacility);

        return testHelper
            .get('/partners/sellers')
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body.length).toEqual(1);

                const item = body[0];
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item.id).toEqual(ginnerFacility.id);
            });
    });

    it('Spinner gets purchasers', async () => {
        const mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        millFacility = await facilityTestHelper.create(mill, UserRoleEnum.MILL);

        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);

        const productDefinition = await ProductDefinitionRepository.make().createOne({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            roleId: mill.roleId,
            fromRoleId: spinner.roleId,
            outputProductDefinitionId: productDefinition.id
        });

        await facilityTestHelper.addPartner(spinnerFacility, millFacility);

        return testHelper
            .get('/partners/purchasers')
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body.length).toEqual(1);

                const item = body[0];
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item.id).toEqual(millFacility.id);
            });
    });

    it('Spinner gets purchasers: Broker actor flow improvements', async () => {
        const mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        millFacility = await facilityTestHelper.create(mill, UserRoleEnum.MILL);

        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);

        await facilityTestHelper.addPartner(spinnerFacility, millFacility);

        return testHelper
            .get('/partners/purchasers')
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                const item = body[0];
                const partnerBroker = item.partnerFacilities[0];

                expect(partnerBroker.type.name).toEqual(UserRoleEnum.MILL);
            });
    });

    it('Spinner gets sellers and searching broker name/businessRegisterNumber', async () => {
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER, { name: 'Testsearch' });

        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);

        await facilityTestHelper.addPartner(spinnerFacility, ginnerFacility);

        return testHelper
            .get('/partners/sellers?key=Testsearch')
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                const item = body[0];
                const partnerBroker = item.partnerFacilities[0];
                expect(partnerBroker.type.name).toEqual(UserRoleEnum.GINNER);
                expect(item.name).toEqual('Testsearch');
            });
    });

    it('Mill gets sellers: Broker actor flow improvements', async () => {
        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);

        const mill = await userTestHelper.createUser({}, UserRoleEnum.MILL);
        millToken = await userTestHelper.getToken(mill);
        millFacility = await facilityTestHelper.create(mill, UserRoleEnum.MILL);

        await facilityTestHelper.addPartner(millFacility, spinnerFacility);

        const productDefinition = await ProductDefinitionRepository.make().createOne({
            name: faker.name.title()
        });
        await supplyChainTestHelper.createSupplyChainNode({
            roleId: mill.roleId,
            fromRoleId: spinner.roleId,
            outputProductDefinitionId: productDefinition.id
        });

        return testHelper
            .get('/partners/sellers')
            .authenticate(millToken)
            .isOk()
            .then(({ body }) => {
                const item = body[0];
                const partnerBroker = item.partnerFacilities[0];
                expect(partnerBroker.type.name).toEqual(UserRoleEnum.SPINNER);
            });
    });

    it('Ginner gets sellers and searching broker name/businessRegisterNumber', async () => {
        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER, {
            businessRegisterNumber: 'Testsearch01'
        });

        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        await facilityTestHelper.addPartner(ginnerFacility, spinnerFacility);

        return testHelper
            .get('/partners/purchasers?key=Testsearch01')
            .authenticate(await userTestHelper.getToken(ginner))
            .isOk()
            .then(({ body }) => {
                const item = body[0];
                const partnerBroker = item.partnerFacilities[0];
                expect(partnerBroker.type.name).toEqual(UserRoleEnum.SPINNER);
                expect(item.businessRegisterNumber).toEqual('Testsearch01');
            });
    });

    it('Ginner gets sellers', async () => {
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);

        const farmGroup = await facilityTestHelper.createFarmGroup();
        await facilityTestHelper.createFarms(farmGroup.id, 3);

        return testHelper
            .get('/partners/sellers')
            .authenticate(await userTestHelper.getToken(ginner))
            .isOk();
    });

    it('Spinner gets transporters', async () => {
        const transporter = await userTestHelper.createUser({}, UserRoleEnum.TRANSPORTER);
        const transportFacility = await facilityTestHelper.create(transporter, UserRoleEnum.TRANSPORTER);

        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        spinnerToken = await userTestHelper.getToken(spinner);

        await facilityTestHelper.addPartner(spinnerFacility, transportFacility);

        return testHelper
            .get('/partners/transporters')
            .authenticate(spinnerToken)
            .isOk()
            .then(({ body }) => {
                expect(body.length).toEqual(1);

                const item = body[0];
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item.id).toEqual(transportFacility.id);
            });
    });

    it('Validate add broker partner failed', async () => {
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        ginnerToken = await userTestHelper.getToken(ginner);

        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);
        await facilityTestHelper.addPartner(spinnerFacility, ginnerFacility);

        return testHelper
            .post('/partners')
            .authenticate(ginnerToken)
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                phoneNumber: testHelper.fakePhoneNumber(),
                name: faker.internet.userName(),
                district: faker.address.city(),
                province: faker.address.state(),
                address: faker.address.streetAddress()
            })
            .isValidateError();
    });

    it('Validate add broker partner successfully', async () => {
        const ginner = await userTestHelper.createUser({}, UserRoleEnum.GINNER);
        ginnerFacility = await facilityTestHelper.create(ginner, UserRoleEnum.GINNER);
        ginnerToken = await userTestHelper.getToken(ginner);

        const spinner = await userTestHelper.createUser({}, UserRoleEnum.SPINNER);
        spinnerFacility = await facilityTestHelper.create(spinner, UserRoleEnum.SPINNER);

        const partners = await facilityTestHelper.addPartner(spinnerFacility, ginnerFacility);

        return testHelper
            .post('/partners')
            .authenticate(ginnerToken)
            .send({
                email: faker.internet.email(),
                firstName: testHelper.fakeFirstName(),
                lastName: testHelper.fakeLastName(),
                phoneNumber: testHelper.fakePhoneNumber(),
                name: partners.partner.name,
                district: faker.address.city(),
                province: faker.address.state(),
                address: faker.address.streetAddress(),
                facilityId: ginnerFacility.id
            })
            .isOk();
    });
});
