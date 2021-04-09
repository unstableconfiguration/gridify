export const sorting = function() {
    let grid = this;
    grid.sort = function(col) { grid.sorting.sort(col); }

    let onHeaderCellCreated = grid.onHeaderCellCreated;
    grid.onHeaderCellCreated = function(th, column) {
        if(column.sort && column.header) {
            grid.sorting.initialize(th, column);
        }
        
        onHeaderCellCreated(th, column);
    }

    grid.sorting = {
        initialize : function(th, column) {   
            grid.sorting.__addSortIcon(th);
            th.addEventListener('click', (th) => {
                let field = th.id.split('-').slice(-1)[0];
                grid.sort(field);
            });  
        }
        /*  .sort('field')
            .sort({ field : '', compare : ()=>{}, direction : 'asc'|'desc'})
        */
        , sort : function(args) {
            let field = typeof(args) === 'string' ? args : args.field;
            if(!field) { return; }

            let options = grid.sorting.__getSortOptions(field);
            if(args.direction) {
                options.direction = args.direction.substr(0, 3) === 'asc' ? 1 : -1
            }
            else { 
                options.direction = options.direction === 1 ? -1 : 1;
            }
            
            let compare = args.compare || options.compare;


            let rows = Array.from(grid.html.tBodies[0].rows);            
            let colIdx = Array.from(rows[0].cells).findIndex(td => {
                return td.id.split('-').slice(-1)[0] == field;
            });

            rows.sort((x, y) => {
                let xv = x.cells[colIdx].value;
                let yv = y.cells[colIdx].value; 
                let compared = compare(xv, yv);
                return +compared * options.direction;
            });
            
            grid.sorting.__redrawGrid(rows);
        }
        , __getSortOptions : function(field) { 
            if(!grid.html.sortOptions) { grid.sorting.__setSortOptions(); }

            return grid.html.sortOptions[field];
        }
        , __setSortOptions : function() {
            let sortOptions = {};

            let columns = grid.html.options.columns;
            columns.forEach(col => {
                sortOptions[col.field] = grid.sorting.__options(col);
            });

            grid.html.sortOptions = sortOptions;
        }
        , __options : function(column) { 
            let options = {
                compare : (a, b) => a <= b ? 1 : -1,
                direction : 1
            }
            if(typeof(column.sort) === 'function') { options.compare = column.sort; }
            if(column.sort && column.sort.compare) {
                options.compare = column.sort.compare;
            }

            return options;
        }
        , __addSortIcon : function(th) { 
            let icon = th.appendChild(document.createElement('span'));
            icon.className = 'sort'
            th.style.paddingRight = '30px';
        }
        , __redrawGrid : function(rows) {
            grid.body.clear();
            let tBody = grid.html.tBodies[0];
            rows.forEach(r => tBody.appendChild(r));
        }
    }
    Object.defineProperty(grid.sorting, 'defaultCompare', { get : () => function(a, b) { if(a == b) { return 0; } return a < b ? 1 : -1; } });
}
