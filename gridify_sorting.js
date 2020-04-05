

Gridify.prototype.extensions.sorting = function(){
    let grid = this;

    let onColumnAdded = grid.header.onColumnAdded;
    grid.header.onColumnAdded = function(headerCell, columnDefinition){
        onColumnAdded(headerCell, columnDefinition);
        if(!columnDefinition.sort) { return; }

        let sortIcon = headerCell.appendChild(document.createElement('span'));
        sortIcon.className = 'sort'

        headerCell.style.paddingRight = '30px';
        headerCell.addEventListener('click', grid.sorting.sortCallback(columnDefinition.field, columnDefinition.sort));
    }

    grid.sorting = {
        sort : function(property, options = {}) {
            options = grid.sorting.setDefaultOptions(options);
            let dir = grid.sorting._columnSortDirection(property, options);
            let rows = grid.body.rows;
            rows.sort((x,y)=>{
                let xv = grid.data.getCellValue(x, property);
                let yv = grid.data.getCellValue(y, property);
                let compared = options.comparator(xv, yv);
                return +compared * dir;
            });
            
            grid.body.clear();
            let tbody = grid.table.tBodies[0];
            rows.forEach(x=>tbody.appendChild(x));
        }
        , sortCallback : function(property, options){
            return ()=>{ grid.sorting.sort(property, options); }
        }
        , setDefaultOptions : function(options){
            if(typeof(options) === 'function') options = { comparator : options };
            if(typeof(options) !== 'object') options = {};

            if(!options.comparator) options.comparator = grid.sorting._defaultComparator;
            return options;
        }
        , _defaultComparator : function(a, b) { if(a==b) return 0; return a<b ? 1 : -1; }
        , _columnSortDirection : function(property, options) {
            let sort_span = grid.header.findCell(property).children[1];
            sort_span.direction = sort_span.direction !== 'asc' ? 'asc' : 'desc';
            return sort_span.direction === 'asc' ? -1 : 1;
        }   
    }
}
