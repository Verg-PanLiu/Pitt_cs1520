/*
  CS1520 Assignment2 Bingo Card
  Pan Liu (pal81)
  Due date: 10/17/2020
*/

window.onload=initialize;


/* function to initialize the web*/
function initialize(){
    document.getElementById('win').style.visibility='hidden'; // hides the "I won" button 
    document.getElementById('lose').style.visibility='hidden'; // hides the "I lost" button
    document.getElementById('wins').innerHTML = localStorage.getItem(0); // displays the total wins in the scoreboard 
    document.getElementById('losses').innerHTML = localStorage.getItem(1); // displays the total losses in the scoreboard 
}


/* function to create the random bingo card*/
function createRandomCard(){
    var validNums = new Array(24);  // array to store the used numbers to avoid duplicate
    var nextIndex = 0;   

    for(var i=0;i<24;i++){   // iterates all table elements except free space
        var nextNum;

        while(true){
            if (i>=12)
                nextNum = Math.floor(Math.random()*15) + Math.floor((i+1)/5)*15 + 1;   // generates valid random numbers for squares whose number larger than 11
            else
                nextNum = Math.floor(Math.random()*15) + Math.floor(i/5)*15 + 1;   // generates valid random numbers for squares whose number less than 11

            var duplicate = false;
            for (var n = 0; n < validNums.length; n++){      // checks duplicate
                if (nextNum == validNums[n]){
                    duplicate = true;
                    break;
                }
            }
            if (duplicate == false){             // stores the valid number in validNums array 
                validNums[nextIndex] = nextNum;
                nextIndex++;
                break;
            }
        }
    
        document.getElementById(i).innerHTML = nextNum;     // displays the number on the web 
        document.getElementById(i).style.backgroundColor = "white";   //sets the background color to white
        document.getElementById(i).value = 0;    // sets the value to 0
        document.getElementById(i).onmousedown = squareColor;     // stores the function reference
    }
    document.getElementById('randomCard').style.visibility='hidden';   // hides the "New Game Random" button 
    document.getElementById('specifiedCard').style.visibility='hidden';    // hides the "New Game Specified" button      
    document.getElementById('win').style.visibility='visible';   // shows the "I Won" button
    document.getElementById('lose').style.visibility='visible';  // shows the "I Lost" button


    document.getElementById('wins').innerHTML = localStorage.getItem(0);   // displays the total wins in the scoreboard 
    document.getElementById('losses').innerHTML = localStorage.getItem(1);  //displays the total losses in the scoreboard 
    return false;
}


/*function to create a player-specified bingo card*/
function createSpecifiedCard(){
    var valid = false;
    var y = ""; 
    while(valid == false){
        if (y == "invalid")
            alert("Invalid input, please try again.");   // alerts the player invalid input

        var response = prompt("Please enter your bingo card");   // asks player to enter their own bingo card

        if (response === null)   // if user cancels the prompt
            return false; 
                
        var r1 = /[Bb]\(([1-9]|1[0-5]),([1-9]|1[0-5]),([1-9]|1[0-5]),([1-9]|1[0-5]),([1-9]|1[0-5])\)/;      
        var r2 = /[Ii]\((1[6-9]|2[0-9]|30),(1[6-9]|2[0-9]|30),(1[6-9]|2[0-9]|30),(1[6-9]|2[0-9]|30),(1[6-9]|2[0-9]|30)\)/;  
        var r3 = /[Nn]\((3[1-9]|4[0-5]),(3[1-9]|4[0-5]),[fF],(3[1-9]|4[0-5]),(3[1-9]|4[0-5])\)/;
        var r4 = /[Gg]\((4[6-9]|5[0-9]|60),(4[6-9]|5[0-9]|60),(4[6-9]|5[0-9]|60),(4[6-9]|5[0-9]|60),(4[6-9]|5[0-9]|60)\)/;
        var r5 = /[Oo]\((6[1-9]|7[0-5]),(6[1-9]|7[0-5]),(6[1-9]|7[0-5]),(6[1-9]|7[0-5]),(6[1-9]|7[0-5])\)/;
        var reg = new RegExp(r1.source + r2.source + r3.source + r4.source + r5.source);  // combines five regular expressions
        var arr = reg.exec(response);    // capturing groups

        while (true){
            if (reg.test(response)){  // checks if the input matches the regular expression

                /* checks duplicate in "B" column */
                if ((arr[1] == arr[2])||(arr[1] == arr[3])||(arr[1] == arr[4])||(arr[1] == arr[5])){y = "invalid";break;}else{
                    if ((arr[2] == arr[3])||(arr[2] == arr[4])||(arr[2] == arr[5])){y = "invalid";break;}else{
                        if ((arr[3] == arr[4])||(arr[3] == arr[5])){y = "invalid";break;}else{
                            if (arr[4] == arr[5]){y = "invalid";break;}
                            }
                        }
                    }
                
                /* checks duplicate in "I" column */
                if ((arr[6] == arr[7])||(arr[6] == arr[8])||(arr[6] == arr[9])||(arr[6] == arr[10])){y = "invalid";break;}else{
                    if ((arr[7] == arr[8])||(arr[7] == arr[9])||(arr[7] == arr[10])){y = "invalid";break;}else{
                        if ((arr[8] == arr[9])||(arr[8] == arr[10])){y = "invalid";break;}else{
                            if (arr[9] == arr[10]){y = "invalid";break;}
                            }
                        }
                    }
                
                /* checks duplicate in "N" column */
                if ((arr[11] == arr[12])||(arr[11] == arr[13])||(arr[11] == arr[14])){y = "invalid";break;}else{
                    if ((arr[12] == arr[13])||(arr[12] == arr[14])){y = "invalid";break;}else{
                        if (arr[13] == arr[14]){y = "invalid";break;}
                        }
                    }
                
                /* checks duplicate in "G" column */
                if ((arr[15] == arr[16])||(arr[15] == arr[17])||(arr[15] == arr[18])||(arr[15] == arr[19])){y = "invalid";break;}else{
                    if ((arr[16] == arr[17])||(arr[16] == arr[18])||(arr[16] == arr[19])){y = "invalid";break;}else{
                        if ((arr[17] == arr[18])||(arr[17] == arr[19])){y = "invalid";break;}else{
                            if (arr[18] == arr[19]){y = "invalid";break;}
                            }
                        }
                    }

                /* checks duplicate in "O" column */
                if ((arr[20] == arr[21])||(arr[20] == arr[22])||(arr[20] == arr[23])||(arr[20] == arr[24])){y = "invalid";break;}else{
                    if ((arr[21] == arr[22])||(arr[21] == arr[23])||(arr[21] == arr[24])){y = "invalid";break;}else{
                        if ((arr[22] == arr[23])||(arr[22] == arr[24])){y = "invalid";break;}else{
                            if (arr[23] == arr[24]){y = "invalid";break;}
                            }
                        }
                    }            
                    valid = true;
                    break;                          
                }
                y = "invalid";
                break;
            }          
        }

    for(var i=0;i<24;i++){
        var nextNum = arr[i+1];
    
        document.getElementById(i).innerHTML = nextNum;   // displays the number on the web
        document.getElementById(i).style.backgroundColor = "white";    //sets the background color to white
        document.getElementById(i).value = 0;   // sets the value to 0
        document.getElementById(i).onmousedown = squareColor;        // stores the function reference
    }

    document.getElementById('randomCard').style.visibility='hidden';       // hides the "New Game Random" button
    document.getElementById('specifiedCard').style.visibility='hidden';    // hides the "New Game Specified" button      
    document.getElementById('win').style.visibility='visible';       // shows the "I Won" button
    document.getElementById('lose').style.visibility='visible';      // shows the "I Lost" button

    document.getElementById('wins').innerHTML = localStorage.getItem(0);       // displays the total wins in the scoreboard 
    document.getElementById('losses').innerHTML = localStorage.getItem(1);      //displays the total losses in the scoreboard 
    return false;
}


/*function to change square background color*/
function squareColor(select){
    var target = select.target;      // gets the element 

    if(target.value == 0){
        target.style.backgroundColor = "#a1fff7";      // changes the background color of the square
        target.value = 1;          // sets the value to 1
    }
    else{
        target.style.backgroundColor = "white";       // changes the background color of the square when user unmark the square
        target.value = 0;        // sets the value to 0
    } 
         
    var gameWin = winCheck();  // checks if user has bingo
    if (gameWin)
        alert("BINGO!");
}


/*function to check bingo*/
function winCheck(){
    var row = new Array(5);

    for (var i = 0; i < row.length; i++) {      // creates a 2-D array 
        row[i] = new Array(5);
    }

    for (var i = 0; i < row.length; i++){     // initialize the array to 0
        for (var j = 0; j < row[i].length; j++){
            row[i][j] = 0;
        }
    }

    var x;
    var y;

    /*stores the result of bingo card to the 2D array*/
    for (var i = 0; i < 24; i++){            
        if (i>=12){
            x = Math.floor((i+1)/5);
            y = (i+1) - x*5;            
        }else{
            x = Math.floor(i/5);
            y = i-x*5;            
        }

        if(document.getElementById(i).value == 1){
            row[y][x] = 1;             
        }
    }
    row[2][2] = 1;

    /*checks if there is BINGO in row horizontally*/
    for (var i = 0; i < row.length; i++){
        var n = 0;
        for (var j = 0; j < row.length; j++){
            if (row[i][j] == 1)
                n++;
        }
        if (n == 5){
            return true;
        }
    }
    
    /*checks if there is BINGO in row vertically*/
    for (var i = 0; i < row.length; i++){
        var n = 0;
        for (var j = 0; j < row.length; j++){
            if (row[j][i] == 1)
                n++;
        }
        if (n == 5){
            return true;
        }
    }
    
    /*checks if there is BINGO in row diagonally*/
    var n = 0;
    for (var i = 0; i < row.length; i++){          
        if (row[i][i] == 1)
            n++;
    }
    if (n == 5){
        return true;
    }

    /*checks if there is BINGO in row diagonally*/
    var d = 0;
    for (var i = 0; i < row.length; i++){          
        if (row[i][4-i] == 1)
            d++;
    }
    if (d == 5){
        return true;
    }

    return false;
}


/*function of "I Won" button*/
function winGame(){
    var win = winCheck();  //checks if the user wins the game 
    if (win){
        var wins = localStorage.getItem(0);   // updates the wins 
        wins++;
        localStorage.setItem(0, wins);
        endGame();         // ends the game 
    }else{
        alert("You haven't won the game yet");   // alerts the user they haven't won the game yet
    }
}


/*function of "I Lost" button */
function loseGame(){
    var losses = localStorage.getItem(1);  //updates the losses
    losses++;
    localStorage.setItem(1, losses);
    endGame();     //end the game 
}

/*function to end the game */
function endGame(){
    for(var i = 0; i < 24; i++){
        document.getElementById(i).innerHTML = '\xa0';   // clears the bingo card 
        document.getElementById(i).style.backgroundColor = "white";  //sets the background color to white
        document.getElementById(i).value = 0;   //sets the value to 0
        document.getElementById(i).onmousedown = "white";    
    }

    document.getElementById('randomCard').style.visibility='visible';  // displays the "New Game Random" button
    document.getElementById('specifiedCard').style.visibility='visible';    // displays the "New Game Specified" button     
    document.getElementById('win').style.visibility='hidden';  // hides the "I Win" button
    document.getElementById('lose').style.visibility='hidden';  // hides the "I Lost" button

    document.getElementById('wins').innerHTML = localStorage.getItem(0);  // displays the wins 
    document.getElementById('losses').innerHTML = localStorage.getItem(1);  // displays the losses 
}


  
