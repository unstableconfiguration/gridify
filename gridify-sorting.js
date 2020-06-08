

Gridify.prototype.extensions.sorting = function(){
    let grid = this;

    let onHeaderCellCreated = grid.onHeaderCellCreated;
    grid.onHeaderCellCreated = function(th, headerDefinition) {
        grid.sorting.initialize(th, headerDefinition);

        onHeaderCellCreated(th, headerDefinition);
    }

    grid.sorting = {
        initialize : function(th, headerDefinition) { 
            if(!headerDefinition.sort) { return; }

            let options = grid.sorting._parseOptions(headerDefinition.sort);
            let idx = Array.from(th.parentElement.children).indexOf(th);
            options.idx = idx;
            th.sort = options;

            grid.sorting._addSortIcon(th);
            
            let sortCallback = grid.sorting._getSortCallback();  
            th.addEventListener('click', sortCallback);    
        }
        , _parseOptions : function(sortOptions) { 
            let options = { compare : grid.sorting.defaultCompare };
            if(typeof(sortOptions) === 'function') { options.compare = sortOptions; }
            else if(typeof(sortOptions) === 'object') {
                for(let k in sortOptions) { options[k] = sortOptions[k]; }
            }

            return options;
        }
        , getSortOptionsByField : function(field) { 
            let idx = grid.html.tBodies[0].options
                .findIndex(colDef => colDef.field == field);

            let th = grid.html.tHead.rows[0].cells[idx];
            return th.sort;
        }
        , sort : function(options) {
            if(typeof(options) === 'string') { 
                options = grid.sorting.getSortOptionsByField(options); 
            }

            options.direction = options.direction === -1 ? 1 : -1;

            let rows = Array.from(grid.html.tBodies[0].rows);            
            rows.sort((x, y) => {
                let xv = x.cells[options.idx].innerText;
                let yv = y.cells[options.idx].innerText; 
                let compared = options.compare(xv, yv);
                return +compared * options.direction;
            });
            
            grid.sorting._redrawGrid(rows);
        }
        , _addSortIcon : function(th) { 
            let icon = th.appendChild(document.createElement('span'));
            icon.className = 'sort'
            th.style.paddingRight = '30px';
        }
        , _getSortCallback : function() {
            return (e) => { grid.sorting.sort(e.target.sort); }
        }
        , _redrawGrid : function(rows) {
            grid.body.clear();
            let tBody = grid.html.tBodies[0];
            rows.forEach(r => tBody.appendChild(r));
        }
    }
    Object.defineProperty(grid.sorting, 'defaultCompare', { get : () => function(a, b) { if(a == b) { return 0; } return a < b ? 1 : -1; } });
}
