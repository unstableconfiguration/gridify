export const filters = function() { 
    let grid = this;
    grid.filter = function() { grid.filters.filter(); }

    let onHeaderCreated = grid.onHeaderCreated;
    grid.onHeaderCreated = function(th, columns) {
        let hasFilters = columns.some(column => column.filter);
        if(hasFilters) { 
            grid.filters.initialize(columns);
            grid.filters.addFilters(columns); 
        }
        
        onHeaderCreated(th, columns);
    }

    grid.filters = { 
        initialize : function(columns) {
            let filterRow = grid.html.tHead.insertRow();
            filterRow.id = grid.html.id + '-filters';
            columns.forEach(col => { 
                filterRow.insertCell(); // .id = xyz, but do we need to name he cell?
            });
        }
        , addFilters : function(columns) {
            let th = grid.html.tHead.rows[1];
            columns.forEach((column, idx) => {
                let filter = grid.filters.addFilter(column);
                if(filter) { th.cells[idx].appendChild(filter); }
            });
        }
        , addFilter : function(column) {
            if(!column.filter) { return; }

            let filter = grid.filters.__getFilterDefinition(column);
            
            let control = filter.control;
            control.id = grid.html.id + '-filters-' + column.field;
            control.compare = filter.compare;
            return control;
        }
        , cells : function() { return Array.from(grid.html.tHead.rows[1].cells); }
        , filter : function() {
            let controls = grid.filters.getControls();
            let rows = Array.from(grid.html.tBodies[0].rows);

            rows.forEach(row => {
                let cells = Array.from(row.cells);
                let isFiltered = controls.some(control => { 
                    let cell = cells.find(td => {
                        return control.id.split('-').slice(-1)[0] == td.id.split('-').slice(-1)[0];
                    });

                    return !control.compare(cell.value, control.value);
                });

                row.filtered = isFiltered;
                row.style.display  = isFiltered ? 'none' : '';
            });

        }
        , getControls : function() {
            return grid.filters.cells().map(cell => cell.firstChild).filter(x => !!x);
        }
        , __getFilterDefinition : function(column) {
            let definition = {
                control : grid.filters.__getDefaultFilterControl(column),
                compare : grid.filters.__getDefaultCompare()
            };

            if(typeof(column.filter) === 'function') { definition.compare = column.filter; }
            if(typeof(column.filter) === 'object') { 
                for(let key in column.filter) {
                    definition[key] = column.filter[key];
                }
            }

            return definition;
        }
        , __getDefaultCompare : function() {
            return function (tdValue, filterValue) {
                return ('' + tdValue).toLowerCase()
                    .substr(0, filterValue.length) == filterValue.toLowerCase();
            }
        }
        , __getDefaultFilterControl : function(column){
            let control = document.createElement('input');
            control.type = 'text';
            control.style = 'display:block; margin: auto; width:80%;';
            control.addEventListener('change', () => { grid.filters.filter(); });
            return control;
        }
    }
}