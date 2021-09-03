export const paging = function() {
    let grid = this;
    grid.page = function(...args) { grid.paging.page(...args); };

    let onTableCreated = grid.onTableCreated;
    grid.onTableCreated = function(table, options) { 
        if(options.paging) { grid.paging.initialize(options.paging); }
        onTableCreated(table, options);
    }

    grid.footer.pager = {
        initialize : function(options){
            let pagingRow = grid.html.tFoot.insertRow();
            pagingRow.id = grid.html.id + '-paging';
            pagingRow.options = options; 
            // Prototype default pager.
            //pagingRow.appendChild(grid.footer.pager.__defaultPagerControl());
        },
        /*__defaultPagerControl : function() { 
            let pagerDiv = document.createElement('div');
            pagerDiv.id = grid.html.id + '-pager';
            
            pagerDiv.appendChild(this.__elPrev());
            pagerDiv.appendChild(this.__elDisplay());
            pagerDiv.appendChild(this.__elNext());

            return pagerDiv;
        },
        __elPrev : function() { 
            let prev = document.createElement('span');
            prev.innerHTML = "Prev ";
            prev.addEventListener('click', e => {
                let data = grid.paging.data;
                if(data.currentPage == 1) { return; }
                grid.paging.data.currentPage--;
                grid.footer.pager.__updateDisplay();
                grid.page(grid.paging.data.currentPage);
            });
            return prev;
        },
        __elNext : function() { 
            let next = document.createElement('span');
            next.innerHTML = " Next";
            next.addEventListener('click', e => {
                let data = grid.paging.data;
                if(data.currentPage == data.visiblePages) { return; }
                grid.paging.data.currentPage++;
                grid.footer.pager.__updateDisplay();
                grid.page(grid.paging.data.currentPage);
            });
            return next;
        },
        __elDisplay : function() {
            let display = document.createElement('span');
            let data = grid.paging.data;
            display.id = grid.html.id + '-pager-display';
            display.innerHTML = "Page 1 of " + data.visiblePages;
            return display;
        },
        __updateDisplay : function() {
            let display = document.querySelector("#" + grid.html.id + "-pager-display");
            let data = grid.paging.data;
            display.innerHTML = "Page " + data.currentPage + " of " + data.visiblePages;
        }*/
     }

    grid.paging = { 
        initialize : function(options){
            if(!options) { return; }

            grid.paging.extendSorting();
            grid.paging.extendFiltering();          

            let pagerData = grid.paging._defaultOptions(options);
            grid.paging.data = pagerData;

            grid.footer.pager.initialize(options); 
            grid.paging.page(pagerData.currentPage);
        }
        // Not sure how to make these modules agnostic of one another. 
        // In the meantime, paging needs to know about sorting and filtering.
        , extendSorting : function(){
            if(typeof(grid.sorting) !== 'undefined'){
                let sort = grid.sorting.sort;
                grid.sorting.sort = function(options = {}){
                    grid.paging.clear();
                    sort(options);
                    let currentPage = grid.paging.data.currentPage;    
                    grid.paging.page(currentPage);
                }
            }
        }
        , extendFiltering : function() {
            if(typeof(grid.filters) !== 'undefined'){
                let filter = grid.filters.filter;
                grid.filters.filter = function() {  
                    grid.paging.clear();
                    filter(); 
                    grid.paging.page();
                    //grid.footer.pager.__updateDisplay();
                }
            }
        }
        , page : function(pageNumber = 1) {
            grid.paging.data.currentPage = pageNumber;
            grid.paging.data.visiblePages = grid.paging._getVisiblePageCount();
            grid.paging._setRowVisibility(pageNumber);
        }
        , clear : function() { 
            let rows = Array.from(grid.html.tBodies[0].rows);
            rows.forEach(r => { if(r.paged) { r.paged = undefined; r.style.display = ''; } });
        }
        // More blending of this with filtering. 
        , _getVisiblePageCount : function() { 
            let rows = Array.from(grid.html.tBodies[0].rows);
            rows = rows.filter(r => !r.filtered);
            return Math.ceil(rows.length / grid.paging.data.rows);;
        }
        , _setRowVisibility : function(pageNumber) {
            let rows = Array.from(grid.html.tBodies[0].rows);
            let options = grid.paging.data;
            
            grid.paging.clear();
            let start = (options.currentPage - 1) * options.rows;
            let end = options.currentPage * options.rows;

            // Only page visible rows
            rows = rows.filter(r => r.style.display !== 'none');
            rows = rows.filter((r, ix) => ix >= end || ix < start);

            rows.forEach(r => {r.style.display = 'none'; r.paged = true; });
        }
        , _defaultOptions : function(options){
            if(typeof(options) !== 'object') options = {};
            options.rows = options.rows || 20;
            options.totalRows = options.totalRows || grid.data.get().length;
            options.totalPages = Math.ceil(options.totalRows/options.rows);
            options.visiblePages = options.totalPages;
            options.currentPage = options.currentPage || 1;
            return options;
        }
    }
}