
//Budget controller
var budgetControl=(function(){
    var Expenses=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    Expenses.prototype.calcPercentage=function(totalInc){
        if(totalInc>0)
        {this.percentage=Math.round((this.value/totalInc) *100);}
        else
        {
            this.percentage=-1;
        }
    }

    Expenses.prototype.getPercentage=function(){
        return this.percentage;
    }
    var Incomes=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    var data={
        allItems:{
            inc:[],
            exp:[]
        },
        total:{
            inc:0,
            exp:0
        },
        budget:0,
        percentage:-1,
    };

    return{
       
        addItem:function(type,descp,val){
            var newData,ID;
            if(data.allItems[type].length>0)
            {
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else
                ID=0;
            
            if(type==='exp')
            {
                newData = new Expenses(ID,descp,val);
            }else if(type==='inc'){
                newData = new Incomes(ID,descp,val);
            }

            //push it into our data-structure
            data.allItems[type].push(newData);

            //return the newItem to be used by other module
            return newData;
        },
        deleteItem:function(type,id){
            var newArr,index;
           
            newArr=data.allItems[type].map(function(current){
                return current.id;
            });
            index=newArr.indexOf(id);

            if(index!==-1){
                data.allItems[type].splice(index,1);
            }


            
        },
        
        calculateTotal:function(type){
            var sum=0;
            data.allItems[type].forEach(function(obj){
                sum+=obj.value;
            });
            data.total[type]=sum;
        },
        calculatePercentages:function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.total.inc);

            });
        },

        getPercentages:function(){
            var allPerc=data.allItems.exp.map(function(curr){
                    return curr.getPercentage();
            })
            return allPerc;

        },

        calculateBudget:function(){
            //calculate total income and expenditure
            budgetControl.calculateTotal('inc');
            budgetControl.calculateTotal('exp');

            //calculate budget
            data.budget=data.total["inc"]-data.total["exp"];
            

            //calculate percentages
            if(data.total["inc"]>0){
            data.percentage=Math.round((data.total['exp']/data.total['inc'])*100);
            }
            else{
                percentage=-1;
            }
        },
        getBudget:function(){
            return{
            totalInc:data.total['inc'],
            totalExp:data.total['exp'],
            budget:data.budget,
            percent:data.percentage
            }
        },
        
        testing:function(){
            console.log(data);
        }
        
    }
    

})();


//UI controller
var uiControl=(function(){
    var DOMinputs={
        inputType: ".add__type",
        inputDescribe:".add__description",
        inputValue:".add__value",
        inputBtn:".add__btn",
        incomeContain:".income__list",
        expenseContain:".expenses__list",
        budgetVal:".budget__value",
        budgetExpencevalue:".budget__expenses--value",
        budgetIncomevalue:".budget__income--value",
        budgetExpencepercentage:".budget__expenses--percentage",
        container:".container",
        percentage:".item__percentage",
        dateLabel:".budget__title--month"
        
    }
    var formatNumber=function(input,type){
        var num,numSplit,int,dec;
        num=Math.abs(input);
        num=num.toFixed(2);

        numSplit=num.split(".");
        int=numSplit[0];
        
        if(int.length>3 && int.length<=5){
            int=int.substring(0,int.length-3)+","+int.substring(int.length-3,int.length);
        }
        else if(int.length>5 ){
            int=int.substring(0,int.length-5)+","+int.substring(int.length-5,int.length-3)+","+int.substring(int.length-3,int.length);
        }

        dec=numSplit[1];
        if(type==="")
        {
            num=int+"."+dec;
            return num;
        }
        num=(type==="exp"?"-":"+")+" "+int+"."+dec;
        return num; 
    };
    var nodelistForeach=function(list,callback){
        for(i=0;i<list.length;i++)
        {   
            callback(list[i],i);
        }

    };
    return{
        displayDate:function(){
            var now;
            now=new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month=now.getMonth();

            year=now.getFullYear();
            document.querySelector(DOMinputs.dateLabel).textContent= months[month]+" "+year;
        },
        getInput: function(){
            return{
                type: document.querySelector(DOMinputs.inputType).value, //input either inc or exp
                describe: document.querySelector(DOMinputs.inputDescribe).value,
                value: parseFloat(document.querySelector(DOMinputs.inputValue).value)
            };
        },
        
        getDOMinputs:function(){
            return DOMinputs;

        
        },

        addListitem:function(obj,type){
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMinputs.incomeContain;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMinputs.expenseContain;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListitem:function(itemID){
            var el;
            el=document.getElementById(itemID);
            el.parentNode.removeChild(el);



        },
        clearFields:function(){
            var fields,arrFields;
            //the value of the form input fields to be deleted
            fields=document.querySelectorAll(DOMinputs.inputDescribe+','+DOMinputs.inputValue);

            arrFields=Array.prototype.slice.call(fields);

            arrFields.forEach(function(curr,ind,arr){
                curr.value="";                
            });
            arrFields[0].focus();
            

        },
        displayBudget:function(obj){
            document.querySelector(DOMinputs.budgetIncomevalue).textContent=formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMinputs.budgetExpencevalue).textContent=formatNumber(obj.totalExp,"exp");
            var budget=formatNumber(obj.budget,"");
            document.querySelector(DOMinputs.budgetVal).textContent=(obj.budget>0?"+":(obj.budget===0?" ":"-"))+" "+budget;
            if(obj.percent>0 && obj.budget>0)
            {
                document.querySelector(DOMinputs.budgetExpencepercentage).textContent=obj.percent+"%";
            }
            else{
                document.querySelector(DOMinputs.budgetExpencepercentage).textContent="---";
            }
            

        },
        displayExpencepercentage:function(percentages){
            var percs;
            percs=document.querySelectorAll(DOMinputs.percentage);

            
            nodelistForeach(percs,function(curr,index){
                if(percentages[index]>0)
                {
                    curr.textContent=percentages[index]+"%";
                }
                else{
                    curr.textContent="---";
                }
                

            });

        },
        focusChangevalue:function(){
            var chng=document.querySelectorAll(DOMinputs.inputType+","+DOMinputs.inputDescribe+","+DOMinputs.inputValue);
            
            nodelistForeach(chng,function(curr){
                curr.classList.toggle("red-focus");
                
            });
            document.querySelector(DOMinputs.inputBtn).classList.toggle("red");
        
        },
        
    };
    
})();


//Global app controller
var controller=(function(budgetctrl,uictrl){
    var setupEventlisteners=function(){
        var Dom=uictrl.getDOMinputs();



        document.querySelector(Dom.inputBtn).addEventListener("click",ctrlAdditem);//checkmark button

        

        document.addEventListener("keypress",function(e){       //press enter key to work
            if(e.keyCode===13 || e.which===13) 
            {
                ctrlAdditem();
            }
            
        });
        document.querySelector(Dom.container).addEventListener("click",ctrlDeleteitem);
        document.querySelector(Dom.inputType).addEventListener("change",uictrl.focusChangevalue);
       
        
        
    };

    var updateBudget=function(){
        var budget;
        //calculate budget
        budgetctrl.calculateBudget();
        //Return budget
        budget=budgetctrl.getBudget();

        //display item on ui
        uictrl.displayBudget(budget);
       
    };

    var ctrlAdditem=function(){
        var input,newItem;
        // Get the input data
        input=uictrl.getInput();
        
        //add item to budget 
        if(input.description!=="" && !isNaN(input.value) && input.value>0){
        newItem=budgetControl.addItem(input.type,input.describe,input.value);
        // add item to ui

        uictrl.addListitem(newItem , input.type);

        //delete the form fields
        uictrl.clearFields();
        
        //calculate and update budget
        updateBudget();
        
        //calculate the percentages
        updatePercent();
        }
        
    };



    



    var updatePercent=function(){
        var percs;
        //calculate the income percentages
        budgetControl.calculatePercentages();

        //call them from  budget controller
        percs=budgetControl.getPercentages();

        //update ui
        uictrl.displayExpencepercentage(percs);
    };
    var ctrlDeleteitem=function(event){
        var itemId,idSplit,type,id;
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId)
        {
            idSplit=itemId.split("-");
            type=idSplit[0];
            id=parseInt(idSplit[1]);
        }
        //delete item frm data structure
        budgetctrl.deleteItem(type,id);

        //delete item from ui
        uictrl.deleteListitem(itemId);

        //calculate the budget
        updateBudget();


        

    };
    return{
        init: function(){

            console.log("App starts now");
            setupEventlisteners();
            uictrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            });
            uictrl.displayDate();
            
            
        }
        
        
    }
    
    
     })(budgetControl,uiControl);

     controller.init();
