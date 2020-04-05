

Gridify.prototype.extensions.sorting = function(){
    let grid = this;

    let onColumnAdded = grid.header.onColumnAdded;
    grid.header.onColumnAdded = function(headerCell, columnDefinition){
        onColumnAdded(headerCell, columnDefinition);
        if(!columnDefinition.sort) { return; }

        grid.sorting._addSortIcon(headerCell);
        let sortCallback = grid.sorting._getSortCallback(columnDefinition.field, columnDefinition.sort);
        headerCell.addEventListener('click', sortCallback);
    }
    grid.sorting = {
        sort : function(property, options) {
            options = grid.sorting._getSortOptions(property, options);
            
            let rows = grid.body.rows;
            rows.sort((x,y) => {
                let xv = grid.data.getCellValue(x, property);
                let yv = grid.data.getCellValue(y, property);
                let compared = options.comparator(xv, yv);
                return +compared * options.direction;
            });
            
            grid.sorting._redrawGrid(rows);
        }
        , _addSortIcon : function(headerCell) { 
            let sortIcon = headerCell.appendChild(document.createElement('span'));
            sortIcon.className = 'sort'
            headerCell.style.paddingRight = '30px';
        }
        , _getSortDirection : function(property) {
            let sortSpan = grid.header.findCell(property).children[1];
            sortSpan.direction = sortSpan.direction !== 'asc' ? 'asc' : 'desc';
            return sortSpan.direction === 'asc' ? -1 : 1;
        }
        // , defaultComparator : Defined using defineProperty() below
        , _getSortCallback : function(property, options) {
            return () => { grid.sorting.sort(property, options); }
        }
        , _getSortOptions : function(property, options) { 
            if(typeof(options) === 'function') { options = { comparator : options } };
            if(typeof(options) !== 'object') { options = { comparator : grid.sorting.defaultComparator } };
            if(!options.comparator) { options.comparator = grid.sorting.defaultComparator; }

            options.direction = grid.sorting._getSortDirection(property);
            return options;
        }
        , _redrawGrid : function(rows) {
            grid.body.clear();
            let tbody = grid.table.tBodies[0];
            rows.forEach(r => tbody.appendChild(r));
        }
    }
    Object.defineProperty(grid.sorting, 'defaultComparator', { get : () => function(a, b) { if(a == b) { return 0; } return a < b ? 1 : -1; } });
}
