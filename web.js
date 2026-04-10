//const { index } = require("mathjs");

let questions = null;
let currentQues = 0;
let currentSec = 0;
var survey = document.getElementById("survey");
let answers = [];
let weights = [50,50,0,0,0,0,0,0,0,0,0,0,0,0];
let maxMin = [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
let scoreMatrix = [];
let chartData = [
          {name: "Criteria", children: [
            {name: "Cardiovascular", children:[ ]},
            {name: "Mental", children: []},
            {name: "Muscular and skeletal", children: []},
            {name : "Vaginal", children:[]},
            {name : "other", children:[]}
          ]}
        ];
    
document.getElementById("survBut").addEventListener('click', ()=>handleNextCLick());
    
function handleNextCLick(){
    if(!questions){
        loadQuestions().then(()=>{
            document.getElementById("survBut").innerHTML = "Next";
            nextQuestion();
        currentQues = currentQues +1;});
        return;
    }
    if(currentSec==2){
        fetch("./scoreMatrix.json")
        .then(response => response.json())
        .then(data => {
             scoreMatrix = data.scoreMatrix;
        }).then(()=>{
        if(answers[0]==1 || answers[1]==1){
            scoreMatrix = scoreMatrix.slice(0,3);
        } else if(answers[2]<2 || answers[4]==1){
            scoreMatrix = scoreMatrix.slice(3,7);
        }else{
            scoreMatrix = scoreMatrix.slice(5,9);
        }
        scores =[]
        for(let i =0;i<scoreMatrix.length;i++){
            scores.push(scoreMatrix[i].score);
        }
        let weightInputs = document.querySelectorAll('input[type="range"]');
        for(let i =0;i<weightInputs.length;i++){
            weights[i] = Number(weightInputs[i].value);
        }
        results = TOPSIS(scores,maxMin,weights); 
        scores = [];
        for(let i = 0;i<results.length;i++){
            scores.push([i,results[i][weights.length]]);
        }
        scores.sort((a,b)=>a[1]-b[1]);
        document.getElementById("graph").hidden=true;
        document.getElementById("formEnter").hidden = true;
        let maxWeight = 0;
        for(let i=0; i<weights.length;i++){
            if(weights[i]>maxWeight){
                maxWeight = weights[i];
            }
        }
        if(maxWeight%10>0){
            maxWeight = maxWeight + (10-(maxWeight%10));
        }
        let Title = document.createElement("h1");
        Title.textContent = "Top Option: " + scoreMatrix[scores[scores.length-1][0]].Treatment;
        document.getElementById("partitionSec").appendChild(Title);

        let desc = document.createElement("p");
        desc.textContent = scoreMatrix[scores[scores.length - 1][0]].desc;
        document.getElementById("partitionSec").appendChild(desc);

        let reason = document.createElement("p");
        let topReasons = nTopReason(Math.min(3,results[scores[scores.length - 1][0]].length-1),results[scores[scores.length - 1][0]]);
        let reasonText = "The main reasons we recommend this treatment is because it best improves ";
        for(let i=0;i<topReasons.length;i++){
            reasonText= reasonText + questions[topReasons[i]].Crit+", ";
        }
        reason.textContent = reasonText;
        document.getElementById("partitionSec").appendChild(reason);
        let graphDiv1 = document.createElement("div");
        graphDiv1.style.height='600px';
        graphDiv1.style.width='50%';
        graphDiv1.setAttribute('id','graph1');
        document.getElementById("partitionSec").appendChild(graphDiv1);
        chart1 = anychart.column();
        var series1 = chart1.column(compileGraphData(results[scores[scores.length - 1][0]]));
        chart1.container("graph1");
        chart1.yScale().maximum(maxWeight);
        chart1.xAxis().labels().rotation(-90);
        chart1.draw();

        let Title2 = document.createElement("h1");
        Title2.textContent ="Alternative Option: " + scoreMatrix[scores[scores.length-2][0]].Treatment;
        document.getElementById("partitionSec").appendChild(Title2);

        let desc2 = document.createElement("p");
        desc2.textContent = scoreMatrix[scores[scores.length - 2][0]].desc;
        document.getElementById("partitionSec").appendChild(desc2);
        
        let reason2 = document.createElement("p");
        let topReasons2 = nTopReason(Math.min(3,results[scores[scores.length - 1][0]].length-1),results[scores[scores.length - 2][0]]);
        let reasonText2 = "The main reasons we recomend this treatment is because it best imporves ";
        for(let i=0;i<topReasons2.length;i++){
            reasonText2= reasonText2 + questions[topReasons[i]].Crit+", ";
        }
        reason2.textContent = reasonText2;
        document.getElementById("partitionSec").appendChild(reason2);
        let graphDiv2 = document.createElement("div");
        graphDiv2.setAttribute('id','graph2');
        graphDiv2.style.height='600px';
        graphDiv2.style.width='50%';
        document.getElementById("partitionSec").appendChild(graphDiv2);
        chart2 = anychart.column();
        var series2 = chart2.column(compileGraphData(results[scores[scores.length - 2][0]]));
        chart2.container("graph2");
        chart2.yScale().maximum(maxWeight);
        chart2.xAxis().labels().rotation(-90);
        chart2.draw();
    });
        return;
    }
    if(currentQues != questions.length){
        if(currentQues == questions.length-1){
                document.getElementById("survBut").innerHTML = "Finish Section";
            }
        if(currentQues != 0){
            answers.push(document.querySelector('input[name="answer"]:checked').value);
        }
        while(survey.hasChildNodes()){
            survey.removeChild(survey.lastChild);
        }
        

    }else{
        
       answers.push(document.querySelector('input[name="answer"]:checked').value);
       while(survey.hasChildNodes()){
            survey.removeChild(survey.lastChild);
        }
       document.getElementById("formEnter").hidden = true;
       currentQues = 0;
       handleAns(answers);
       return;
    }
    
    nextQuestion();
    currentQues = currentQues + 1;

}


function loadQuestions() {
    let filePath = "./Sec" + currentSec + ".json";
    return fetch(filePath)
        .then(response => response.json())
        .then(data => {
            questions = data.questions;
        });
}

function nextQuestion(){
    document.getElementById("question").textContent = questions[currentQues].ques;
    for(let i=0;i<questions[currentQues].ans.length;i++){
        let ans = document.createElement("input");
        ans.setAttribute('type','radio');
        ans.setAttribute('id',questions[currentQues].ans[i]);
        ans.setAttribute('value',questions[currentQues].ansValues[i]);
        ans.setAttribute('name','answer')
        survey.appendChild(ans);
        let label = document.createElement('label');
        label.setAttribute('for',questions[currentQues].ans[i] );
        label.textContent = questions[currentQues].ans[i];
        survey.appendChild(label);
        let linebreak = document.createElement('br');
        survey.appendChild(linebreak);
    }}

    function loadRankings(){
        document.getElementById("question").textContent="For each of these categories, score how important they are too you:";
        for(let i=0;i<questions.length;i++){
            let label = document.createElement('label');
            label.setAttribute('for',questions[i].Crit);
            label.textContent = questions[i].Crit+":";
            survey.appendChild(label);
            let ans = document.createElement("input");
            ans.setAttribute('type','range');
            ans.setAttribute('id',questions[i].Crit);
            ans.setAttribute('value',weights[i]);
            ans.setAttribute('min','0');
            ans.setAttribute('max','100');
            survey.appendChild(ans);
            survey.appendChild(document.createElement('br'));
            if([2,8].includes(i)){
                chartData[0].children[0].children.push({name: questions[i].Crit, value: weights[i],fill:"#7BDBB0"});
            }else if([3,4,6,7,12].includes(i)){
                chartData[0].children[1].children.push({name: questions[i].Crit, value: weights[i],fill:"#807BDB"});
            }else if([5,11].includes(i)){
                chartData[0].children[2].children.push({name: questions[i].Crit, value: weights[i],fill:"#DB7BA6"});
            }else if([9,10].includes(i)){
                chartData[0].children[3].children.push({name: questions[i].Crit, value: weights[i],fill:"#D6DB7B"});
            }else if([13].includes(i)){
                chartData[0].children[4].children.push({name: questions[i].Crit, value: weights[i],fill:"#d37bdb"});}
        }
        document.getElementById("graph").hidden = false;
        var chart = anychart.treeMap(chartData, "as-tree");

        chart.title("severity of criteria");
        chart.container("graph");
        chart.maxDepth(2);
        chart.labels().adjustFontSize(true);
        // initiate drawing the chart
        chart.draw();
        
    }


function handleAns(answers){
    switch(currentSec){
        case 0:
            if(answers.includes("1")){
                let infoText = document.createElement("p");
                infoText.append("Your response of ‘yes’ to some of these questions could indicate significant a health issue. We recommend that you talk to your health care provider to be referred onto a specialist before continuing to explore treatment options.");
                document.getElementById("partitionSec").appendChild(infoText);
                document.getElementById("formEnter").hidden = true;
                break;
            }else{
                currentSec = 1;
                currentQues = 0;
                questions = null;
                answers.splice(0);
                handleNextCLick();
                document.getElementById("formEnter").hidden = false;
                break;
            }
        case 1:
            currentSec = 2;
            loadQuestions().then(()=>{
            if(answers[2]<2){
                weights[11]+=10;
                weights[12]+=5;
            }else if(answers[2]==3){
                weights[13]+=5;
            }
            if(answers[3]==0){ //if user wants more frequent medication, try and take daily med.
                maxMin[1]=1;
            }
            if(answers[4]==1){//osteporosis history
                weights[11]+= 20;
            }
            if(answers[6]==1){//dementia history
                weights[12]+= 20;
            }
            if(answers[7]==1){//cancer history
                weights[11]+= 20;
            }
            if(answers[9]==1){ //smoke
                weights[2]+=5;
                weights[12] += 5;

            }
            if(answers[10]>0){ //drink in any moderation
                weights[8]+=20;
            }
            if(answers[7]==1){
                weights[13] += 10;
            }
            for(let i = 11; i<=19;i++){
                weights[i-9] += Number(answers[i]);
            }
            loadRankings();
            document.getElementById("formEnter").hidden = false;})
            
    }
}



function distance(x,y){
    dis = 0;
    for(let i =0; i < x.length;i++){
        dis = dis + (x[i]-y[i])**2;
    }
    return dis**0.5;
}
//need fixing add pos or neg for criteria
function TOPSIS(scoreMatrix,posNeg,weights){
    //console.log(scoreMatrix);
    //normalise array and apply weights
    let numCol = scoreMatrix[0].length;
    for(let i =0; i < numCol;i++){
        let temp = 0;
        for(let j = 0; j < scoreMatrix.length;j++){
            temp = temp + (scoreMatrix[j][i]**2);
        }
        temp = temp**0.5;
        for(let j =0; j<scoreMatrix.length;j++){
            scoreMatrix[j][i] = (scoreMatrix[j][i]/temp)*weights[i];
        }
    }
    let max = Array(numCol).fill(0);
    let min = Array(numCol).fill(0);
    for(let i=0; i<numCol;i++){
        max[i] = scoreMatrix[0][i];
        min[i] = scoreMatrix[0][i];
        let maxVal = -(Infinity);
        let minVal = Infinity;
        for (let j = 0; j < scoreMatrix.length; j++){
                if (scoreMatrix[j][i] > maxVal){
                    maxVal = scoreMatrix[j][i];}
                if(scoreMatrix[j][i]<minVal){
                    minVal=scoreMatrix[j][i];
                }
            }
            if(posNeg[i]==1){
                max[i] = maxVal;
                min[i] = minVal;
            }else{
                max[i] = minVal;
                min[i] = maxVal;
            }
    }
    for(let i = 0; i<scoreMatrix.length;i++){
        let bestDis = distance(scoreMatrix[i],max);
        let worstDis = distance(scoreMatrix[i],min);
        scoreMatrix[i].push(worstDis/(worstDis+bestDis)); //high score better
    }
    return scoreMatrix
}

function nTopReason(n,result){
    sortVal = result.slice(0,result.length-1);
    for(let i=0; i<sortVal.length;i++){
        if(maxMin[i]<0){
            sortVal[i] = weights[i]-sortVal[i];
        }
    }
    r = sortVal.slice();
    sortVal.sort((a,b)=>a-b);
    let ind = [];
    for(let i =0; i<n;i++){
        ind.push(r.indexOf(sortVal[sortVal.length-(i+1)]))
        r[ind[i]] = 0;
    }
    return ind;

}

function compileGraphData(score){
    let data = [];
    for(let i=0;i<score.length-1;i++){
        let x;
        if(maxMin<0){
            x = weights[i]-score[i];
        }else{
            x = score[i];
        }
        data.push([questions[i].Crit,x]);
    }
    return data;
}
