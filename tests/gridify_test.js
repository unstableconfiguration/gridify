let assert = chai.assert;

describe('Gridify Tests', function(){
    
    describe('Initialization', function(){
        it('Initializes around a data table')
    });

    describe('Column definitions', function(){
        it('Defaults header text to field text if not specified');
        it('Allows header text to be defined');
        it('Allows header style defaults to be overridden.');
        it('Allows column style defaults to be overridden');
    });

    describe('Data access', function(){
        it('Allows data to be supplied to the table');
        it('Can retrieve a data set from the table');
        it('Can retrieve a data row from the table');
        it('Can retrieve a cell value from the table');
        it('Can modify a cell\'s value');
        
    });

    describe('Sorting', function(){
        it('Appends a sort icon on sortable columns');
        it('Defaults to alphabetical sorting.');
        it('Allows for custom sorting if sort function is provided.')
    });

    describe('Filtering', function(){
        it('Adds a filter textbox on filterable columns');
        it('Defaults to xyz% filtering function');
        it('Allows for custom filter control');
        it('Allows for custom filter logic')
    });

    describe('Paging', function(){
        it('Limits visible results when paging is true');
        it('')

    });

});
