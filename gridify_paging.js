Gridify.prototype.extensions.paging = function(div){
    let grid = this;

    let on_grid_initialized = grid.on_initialized;
    grid.on_initialized = function(options){
        on_grid_initialized(options);
        grid.paging.initialize(options.paging);
    }

    grid.footer.pager = {
        initialize : function(options){
            let paging_row = grid.table().tFoot.insertRow();
            paging_row.id = grid.table().id + '_paging';
            paging_row.options = JSON.stringify(options); 

            let left_cell = paging_row.insertCell();
            left_cell.id = grid.table().id + '_paging_left';
            left_cell.style = 'width:33%;';

            let center_cell = paging_row.insertCell();
            center_cell.id = grid.table().id + '_paging_center';
            center_cell.style = 'width:33%;';
            center_cell.appendChild(grid.footer.pager.center_cell_control(options));

            let right_cell = paging_row.insertCell();
            right_cell.id = grid.table().id + '_paging_right';
            right_cell.style = 'width:33%'    

        }
        , set_page : function(page_number){
            let options = grid.options();
            options.current_page = page_number;

            let textbox = document.getElementById(grid.table().id + '_paging_center_textbox');
            if(textbox) textbox.value = page_number;
            // set row counter when up
        }
        , center_cell_control : function(options){
            let container = document.createElement('div');
            container.style = 'width:120px'

            let textbox = document.createElement('input');
            textbox.id = grid.table().id + '_paging_center_textbox';
            textbox.className = 'pager_textbox';
            textbox.value = options.current_page || 1;

            let label = document.createElement('span');
            label.style = 'width:40px;vertical-align:top';
            label.innerText = ' of ' + options.total_pages || 1;

            let left_arrow = document.createElement('div');
            left_arrow.className = 'pager_left';
            left_arrow.onclick = () => 
                grid.paging.page(textbox.value > 1 ? +textbox.value -1 : 1);
            
            let right_arrow = document.createElement('div');
            right_arrow.className = 'pager_right';
            right_arrow.onclick = () => 
                grid.paging.page(textbox.value < options.total_pages ? +textbox.value+1 : options.total_pages); 

            container.appendChild(left_arrow);
            container.appendChild(textbox);
            container.appendChild(label);
            container.appendChild(right_arrow);

            return container;
        }
    }


    grid.paging = { 
        initialize : function(options){
            if(!options) return;
            options = grid.paging._default_options(options);
            grid.footer.pager.initialize(options); 
            grid.paging.page(options.current_page);
        }
        , page : function(page_number){
            grid.paging._set_footer_values(page_number);
            grid.paging._set_row_visibility(page_number);
        }
        , _set_row_visibility : function(page_number){
            let rows = grid.body.rows();
            let options = grid.options();
            // Undo previous paging 
            rows.forEach(r => { if(r.paged) { r.paged = undefined; r.style.display = ''; } });
            
            let start = (options.current_page-1)*options.rows;
            let end = options.current_page*options.rows;
            // Only page visible rows
            rows = rows.filter(r => r.style.display !== 'none');
            rows = rows.filter((r, ix) => ix >= end || ix < start);

            rows.forEach(r => {r.style.display = 'none'; r.paged = true; });

        }
        , _set_footer_values : function(page_number){
            grid.footer.pager.set_page(page_number);
        }
        , _default_options : function(options){
            if(typeof(options) !== 'object') options = {};
            options.rows = options.rows || 20;
            options.total_rows = options.total_rows || grid.data.get().length;
            options.total_pages = Math.ceil(options.total_rows/options.rows);
            options.current_page = options.current_page || 1;
                // need to extract from UI if present
            return options;
        }
    }
}