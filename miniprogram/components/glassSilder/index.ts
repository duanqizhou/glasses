// components/glassSilder/index.ts
interface listFace {
    id: string,
    text: string | number,
    left: number,
    right: number
}
interface selectListCFace {
    row: string,
    num: number,
    select: boolean
}
interface selectListFace {
    [x: string]: selectListCFace[]
}
interface dataFace {
    [x: string]: any
    list: listFace[] | [],
    selectList: selectListFace
}
interface getXY {
    x: number
    y: number
}
Component<dataFace, any, any>({
    data: {
        list: [],
        scrollIntoView: "",
        currentRow: '',
        selectList: {},
        matrixList: [],
        colList: ['0.00', '0.25', '0.50', '0.75', '1.00', '1.25'],
        rowList: ['0.00', '0.25', '0.50', '0.75', '1.00'],
        selectListHead:[],
        sliderLock:false,

    },
    lifetimes: {
        attached: function () {
            this.InitData()
        },
    },
    methods: {
        InitData(): void {
            this.initSilderRow()
            this.initMatrixList()
        },
        initSilderRow() {
            const that = this;
            let list: any;
            let query = wx.createSelectorQuery().in(this);
            query.select('.computer').boundingClientRect(rect => {
                const width = rect.width;
                list = that.data.rowList.map((text: string, index: number) => ({
                    text: text,
                    id: 'D_' + index,
                    left: width * index - (width / 2),
                    right: width * (index + 1) - (width / 2)
                }))
                that.setData({
                    currentRow: list[0].text,
                    currentRowIndex: 0,
                    list,
                })
            }).exec();
        },
        initMatrixList() {
            var matrixList = [];
            const row = [...this.data.rowList]
            const col = [...this.data.colList]
            for (let c = 0; c < col.length; c++) {
                var tempRow = []
                for (let r = 0; r < row.length; r++) {
                    tempRow.push({
                        num: 1
                    })
                }
                matrixList.push(tempRow)
            }

            this.setData({
                matrixList
            })
        },
        getMatrixListXY(row: string, col: string): getXY {
            const rowList = this.data.rowList
            const colList = this.data.colList

            if (rowList.length <= 0 || colList.length <= 0) return {
                x: -1,
                y: -1
            }
            const rowIndex = colList.indexOf(row)
            const colIndex = rowList.indexOf(col)
            return {
                x: rowIndex,
                y: colIndex
            }
        },
        setMatrixListXY(row: string, col: string, num: number = 1): void {

            const matrixList = JSON.parse(JSON.stringify(this.data.matrixList))
            if (matrixList[row] && matrixList[row][col]) {
                num = Number(num)
                if(Number.isNaN(num) || num <= 0) num = 1;
                matrixList[row][col].num = num
             }
             this.setData({
                matrixList
             })
        },
        checkboxChange(e: WechatMiniprogram.CustomEvent) {
            const value = e.detail.value
            const tempSelectList: selectListCFace[] = value.map((c: string) => {
                const RowCol = c.split(',')
                const row = RowCol[0]
                const col = RowCol[1]

                const pos: getXY = this.getMatrixListXY(row, col)

                const num = this.data.matrixList[pos.x][pos.y].num
                return {
                    row,
                    col,
                    num,
                    select: true,
                }
            })
            const selectList = JSON.parse(JSON.stringify(this.data.selectList))
            selectList[this.data.currentRow] = tempSelectList
            const selectListHead = this.data.selectListHead
            selectListHead.push(this.data.currentRow)
            this.setData({
                selectList,
                selectListHead:[...new Set(selectListHead)]
            })
        },
        changeMatrixNum(e: WechatMiniprogram.CustomEvent) {
            const num = e.detail.value
            const col = e.currentTarget.dataset.col;
            const pos: getXY = this.getMatrixListXY(col,this.data.currentRow)
            this.setMatrixListXY(pos.x,pos.y,num)
        },
        binddragendHandle(e: WechatMiniprogram.CustomEvent) {
            if(this.data.sliderLock){
                this.setData({
                    sliderLock:false
                })
                return
            }
            console.log(2)
            const leftOffset = e.detail.scrollLeft
            const list: listFace[] = [...this.data.list]
            if (list.length > 0) {
                const index = list.findIndex(i => (i.left <= leftOffset && i.right >= leftOffset))
                if (index != -1) {
                    this.setData({
                        scrollIntoView: list[index].id,
                        currentRow: list[index].text,
                        currentRowIndex: index
                    })
                }
            }
        },
        sliderClickHandle(e: WechatMiniprogram.CustomEvent){
            const idindex = e.currentTarget.dataset.idindex
            if(this.data.scrollIntoView == this.data.list[idindex].id) return;
            this.setData({
                scrollIntoView: this.data.list[idindex].id,
                currentRow: this.data.list[idindex].text,
                currentRowIndex: idindex,
                sliderLock:true
            })

        }
    }
})
