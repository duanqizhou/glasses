// components/glassSilder/index.ts
interface listFace {
    id: string,
    text: string,
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
    selectList: selectListFace,
    currentRow: string
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
        selectListHead: [],
        sliderLock: false,
        selectAll: false

    },
    lifetimes: {
        attached: function () {
            this.InitData()
        },
    },
    methods: {
        selectAllHandle(e: WechatMiniprogram.CustomEvent) {
            const that = this;
            const value = e.detail.value[0]
            const selectList = JSON.parse(JSON.stringify(that.data.selectList))
            const selectListHead = that.data.selectListHead
            if (value) {
                const _index = that.data.rowList.indexOf(value)
                if (_index == -1) return;
                const tempSelectList: selectListCFace[] = that.data.colList.map((val: string, key: number) => ({
                    row: val,
                    col: value,
                    num: that.data.matrixList[key][_index].num,
                    select: true,
                }))
                selectList[that.data.currentRow] = tempSelectList
                selectListHead.push(that.data.currentRow)
            } else {
                // 取消全选
                selectList[that.data.currentRow] = []
                selectListHead.splice(selectListHead.indexOf(that.data.currentRow), 1)
                that.checkIsSelectAll()
            }
            that.setData({
                selectList,
                selectListHead: [...new Set(selectListHead)]
            })
            that.checkIsSelectAll()
        },
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
        checkIsSelectAll(): void {
            const checkList = this.data.selectList[this.data.currentRow]
            console.log(checkList,this.data.currentRow,this.data.selectList)
            if (checkList && Array.isArray(checkList) && checkList.length == this.data.colList.length) {
                this.setData({
                    selectAll: true
                })
            } else {
                this.setData({
                    selectAll: false
                })
            }

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
        updateSelectList(row: string, col: string, num: number | string): void {
            const selectList = JSON.parse(JSON.stringify(this.data.selectList))
            col = this.data.rowList[col]
            row = this.data.colList[row]

            const disposeList = selectList[col]

            if (disposeList && Array.isArray(disposeList)) {

                for (let index = 0; index < disposeList.length; index++) {
                    const currentItem = disposeList[index];
                    if (currentItem.row == row) {
                        currentItem.num = num
                        this.setData({
                            selectList
                        })
                        return
                    }
                }

            }
        },
        setMatrixListXY(x: string, y: string, num: number = 1): void {
            const matrixList = JSON.parse(JSON.stringify(this.data.matrixList))
            if (matrixList[x] && matrixList[x][y]) {
                num = Number(num)
                if (Number.isNaN(num) || num <= 0) num = 1;
                matrixList[x][y].num = num
            }
            this.updateSelectList(x, y, num)
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
                selectListHead: [...new Set(selectListHead)]
            })
            this.checkIsSelectAll()
        },
        changeMatrixNum(e: WechatMiniprogram.CustomEvent) {
            var num = e.detail.value
            const col = e.currentTarget.dataset.col;
            if (num >= 999) num = 999;
            if (num <= 1) num = 1;
            const pos: getXY = this.getMatrixListXY(col, this.data.currentRow)
            this.setMatrixListXY(pos.x, pos.y, num)
        },
        binddragendHandle(e: WechatMiniprogram.CustomEvent) {
            if (this.data.sliderLock) {
                this.setData({
                    sliderLock: false
                })
                return
            }
            const leftOffset = e.detail.scrollLeft
            const list: listFace[] = [...this.data.list]
            if (list.length > 0) {
                const index = list.findIndex(i => (i.left <= leftOffset && i.right >= leftOffset))
                if (index != -1) {
                    this.setData({
                        scrollIntoView: list[index].id,
                        currentRow: list[index].text,
                        currentRowIndex: index,
                        selectAll: false
                    })
                }
            }
            this.checkIsSelectAll()
        },
        sliderClickHandle(e: WechatMiniprogram.CustomEvent) {
            const idindex = e.currentTarget.dataset.idindex
            if (this.data.scrollIntoView == this.data.list[idindex].id) return;
            this.setData({
                scrollIntoView: this.data.list[idindex].id,
                currentRow: this.data.list[idindex].text,
                currentRowIndex: idindex,
                sliderLock: true,
            })
            this.checkIsSelectAll()
        },
        add(e: WechatMiniprogram.CustomEvent): void {
            const col = e.currentTarget.dataset.col;
            const pos: getXY = this.getMatrixListXY(col, this.data.currentRow)
            const _currentNum: number | string = this.data.matrixList[pos.x][pos.y].num
            if (_currentNum >= 999) return;
            this.setMatrixListXY(pos.x, pos.y, Number(_currentNum) + 1)
        },
        reduce(e: WechatMiniprogram.CustomEvent): void {
            const col = e.currentTarget.dataset.col;
            const pos: getXY = this.getMatrixListXY(col, this.data.currentRow)
            const _currentNum: number | string = this.data.matrixList[pos.x][pos.y].num
            if (_currentNum <= 1) return;
            this.setMatrixListXY(pos.x, pos.y, Number(_currentNum) - 1)
        }
    }
})
