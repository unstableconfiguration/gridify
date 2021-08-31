import { Gridify } from '../app/gridify.js';

export const FilteringTests = function() {
    describe('Filtering', function(){
        let assert = chai.assert;

        let getHiddenRows = function(grid) { 
            return Array.from(grid.html.tBodies[0].rows)
                .filter(row => row.style.display == 'none');
        }
        
        it('Adds a filter textbox on filterable columns', function() {
            let grid = new Gridify({
                columns : [ { field : 'Col', header : 'Col', filter : true } ],
                data : [ { Col : 'a' } ]
            });
            assert(grid.html.tHead.rows[1].cells[0].firstChild.id == 'new-grid-filters-Col');
        });

        it('Defaults to xyz% filtering function', function(){
            let grid = new Gridify({
                columns : [ { field : 'Col', header : 'Col', filter : true } ],
                data : [ { Col : 'aab' }, { Col : 'abc' }, { Col : 'bca'}]
            });

            let filterTextbox = grid.html.tHead.rows[1].cells[0].firstChild;
            filterTextbox.value = 'a';
            grid.filter();
            assert(getHiddenRows(grid).length == 1);
            
            filterTextbox.value = 'aa';
            grid.filter();
            assert(getHiddenRows(grid).length == 2);
        });
        it('Applies all filters to the data set', function() {
            let grid = new Gridify({
                columns : [ 
                    { field : 'ColA', header : 'Col A', filter : true }, 
                    { field : 'ColB', header : 'Col B', filter : true } 
                ],
                data : [ 
                    { ColA : 'a', ColB : 'a' }, 
                    { ColA : 'a', ColB : 'b' }, 
                    { ColA : 'b', ColB : 'a' },
                    { ColA : 'b', ColB : 'b' } ]
            });

            grid.html.tHead.rows[1].cells[0].firstChild.value = 'a';
            grid.html.tHead.rows[1].cells[1].firstChild.value = 'b';
            grid.filter();
            assert(getHiddenRows(grid).length == 3);
        });
        it('Allows for custom filter logic', function() {
            let grid = new Gridify({
                columns : [ 
                    { 
                        field : 'Col', 
                        header : 'Col A',
                        filter : { 
                            compare : (cellValue, filterValue) => {
                                return cellValue.includes(filterValue);
                            }
                        }
                    } 
                ],
                data : [ { Col : 'abcd' }, { Col : 'dcba' } ]
            });

            grid.html.tHead.rows[1].cells[0].firstChild.value = 'bc';
            grid.filter();
            assert(getHiddenRows(grid).length == 1);
        });
        it('Allows for custom filter control', function() {
            let chk = document.createElement('input');
            chk.type = 'checkbox'
  
            let grid = new Gridify({ 
                columns : [ 
                    { 
                        field : 'Col', 
                        header : 'Col A',
                        filter : {
                                control : chk,
                                compare : function(cellValue, filterValue) {
                                    if(+filterValue === 0) { return true; }
                                    return +filterValue === +cellValue;
                                }
                            }
                        }  
                    ],
                data : [ { Col : 1 }, { Col : 0 }, { Col : 1 } ]
            });
            //chk.addEventListener('change', () => { grid.filter() });
            
            grid.html.tHead.rows[1].cells[0].firstChild.value = 1;
            grid.filter();
            assert(getHiddenRows(grid).length == 1);
        });
    });
}
