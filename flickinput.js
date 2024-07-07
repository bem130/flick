function FlickInput(canvas,label,width,height,margin=10,radius=10) {
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    let pressedbtn = false;
    let pressedpos = [0,0];
    let btnwidth;
    let btnheight;
    let popupbtn = false;
    const colpos = (()=>{
        btnwidth = (width-margin*6)/5;
        let x = 0;
        const res = [];
        for (let i=0;i<5;i++) {
            let p = [];
            x += margin;
            p.push(x);
            x += btnwidth;
            p.push(x);
            res.push(p);
        }
        return res;
    })()
    const rowpos = (()=>{
        btnheight = (height-margin*(5+2)-20*2)/4;
        let x = margin+20;
        const res = [];
        for (let i=0;i<4;i++) {
            let p = [];
            x += margin;
            p.push(x);
            x += btnheight;
            p.push(x);
            res.push(p);
        }
        return res;
    })()
    console.log(btnheight)
    roundrect = (x, y) => {
        const r = radius;
        ctx.beginPath();
        ctx.moveTo(x[0] + r, y[0]);
        ctx.lineTo(x[1] - r, y[0]);
        ctx.arc(x[1] - r, y[0] + r, r, Math.PI * (3/2), 0, false);
        ctx.lineTo(x[1], y[1] - r);
        ctx.arc(x[1] - r, y[1] - r, r, 0, Math.PI * (1/2), false);
        ctx.lineTo(x[0] + r, y[1]);
        ctx.arc(x[0] + r, y[1] - r, r, Math.PI * (1/2), Math.PI, false);
        ctx.lineTo(x[0], y[0] + r);
        ctx.arc(x[0] + r, y[0] + r, r, Math.PI, Math.PI * (3/2), false);
        ctx.closePath();
    }
    const UpdateUI = ()=>{
        { // ボタン
            ctx.clearRect(0,0,width,height);
            for (let i=0;i<colpos.length;i++) {
                for (let j=0;j<rowpos.length;j++) {
                    const btncenter = [(colpos[i][0]+colpos[i][1])/2,(rowpos[j][0]+rowpos[j][1])/2]
                    { // ボタン
                        ctx.fillStyle = `hsl(250deg,10%,50%)`;
                        if (i==pressedbtn[0]&&j==pressedbtn[1]) {
                            ctx.fillStyle = `hsl(250deg,10%,40%)`;
                        }
                        if (i==0||i==4) {
                            ctx.fillStyle = `hsl(250deg,0%,50%)`;
                        }
                        roundrect(colpos[i],rowpos[j]);
                        ctx.fill();
                        { // 文字
                            ctx.fillStyle = `hsl(200deg,10%,80%)`;
                            ctx.font = "40px serif";
                            let box = ctx.measureText(label[j][i][0]);
                            ctx.fillText(label[j][i][0],btncenter[0]-box.width/2,btncenter[1]+40*0.8/2);
                        }
                    }
                }
            }
            for (let i=0;i<colpos.length;i++) {
                for (let j=0;j<rowpos.length;j++) {
                    const btncenter = [(colpos[i][0]+colpos[i][1])/2,(rowpos[j][0]+rowpos[j][1])/2]
                    if (i==pressedbtn[0]&&j==pressedbtn[1]) { // ポップアップ
                        const ir = (btnheight*0.1+40);
                        const r = 20;
                        { // ボタン
                            const popup = `hsl(230deg,10%,50%)`;
                            const popupselect = `hsl(230deg,10%,60%)`;
                            const popupcenter = [
                                [btncenter[0],btncenter[1]],
                                [btncenter[0]-ir,btncenter[1]],
                                [btncenter[0],btncenter[1]-ir],
                                [btncenter[0]+ir,btncenter[1]],
                                [btncenter[0],btncenter[1]+ir],
                            ]
                            for (let k=1;k<5;k++) {
                                if (label[j][i][k]==null) {continue;}
                                // 背景
                                ctx.fillStyle = popupbtn==k?popupselect:popup;
                                ctx.beginPath();
                                ctx.arc(...popupcenter[k],r,0,Math.PI*2);
                                ctx.fill();
                                // 文字
                                ctx.fillStyle = `hsl(200deg,10%,80%)`;
                                ctx.font = "20px serif";
                                {
                                    let box = ctx.measureText(label[j][i][k]);
                                    ctx.fillText(label[j][i][k],popupcenter[k][0]-box.width/2,popupcenter[k][1]+20*0.8/2);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    UpdateUI();
    const getPointer = (e)=>{
        const rect = canvas.getBoundingClientRect();
        return [(e.clientX-rect.left)/(rect.right-rect.left)*canvas.width,(e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height];
    }
    const distance = (p1,p2)=>{
        return Math.sqrt((p2[0]-p1[0])**2+(p2[1]-p1[1])**2);
    }
    canvas.onpointerdown = (e)=>{
        const p = getPointer(e);
        pressedbtn = false;
        pressedpos = p;
        for (let i=0;i<5;i++) {
            for (let j=0;j<4;j++) {
                if (colpos[i][0]<p[0]&&p[0]<colpos[i][1]) {
                    if (rowpos[j][0]<p[1]&&p[1]<rowpos[j][1]) {
                        pressedbtn = [i,j]
                    }
                }
            }
        }
        canvas.onpointermove(e);
        e.target.setPointerCapture(e.pointerId);
    }
    canvas.onpointermove = (e)=>{
        const p = getPointer(e);
        const displacement = [pressedpos[0]-p[0],pressedpos[1]-p[1]];
        const angle = Math.atan2(...displacement)/Math.PI*4;
        if (pressedbtn==false) {
            popupbtn = false;
        }
        else if (distance(pressedpos,p)<20) {
            popupbtn = 0;
        }
        else if (Math.abs(angle)>=3) {
            popupbtn = 4;
        }
        else if (Math.abs(angle)<=1) {
            popupbtn = 2;
        }
        else if (angle>0) {
            popupbtn = 1;
        }
        else {
            popupbtn = 3;
        }
        UpdateUI();
    }
    canvas.onpointerup = (e)=>{
        if (pressedbtn!=false) {
            const event = new CustomEvent("flick", { detail:{btnnum:[pressedbtn,popupbtn],label:[label[pressedbtn[1]][pressedbtn[0]][popupbtn]]} });
            canvas.dispatchEvent(event);
        }
        pressedbtn = false;
        popupbtn = false;
        UpdateUI();
    }
}