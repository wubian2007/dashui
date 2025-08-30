// 足球打水计算器核心逻辑
class FootballArbitrageCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.mainOddsInput = document.getElementById('mainOdds');
        this.mainAmountInput = document.getElementById('mainAmount');
        this.mainRebateInput = document.getElementById('mainRebate');
        this.subOddsInput = document.getElementById('subOdds');
        this.subRebateInput = document.getElementById('subRebate');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resultsSection = document.getElementById('resultsSection');
        
        // 结果元素
        this.subAmountElement = document.getElementById('subAmount');
        this.totalInvestmentElement = document.getElementById('totalInvestment');
        this.mainReturnElement = document.getElementById('mainReturn');
        this.subReturnElement = document.getElementById('subReturn');
        this.mainRebateAmountElement = document.getElementById('mainRebateAmount');
        this.subRebateAmountElement = document.getElementById('subRebateAmount');
        this.totalReturnElement = document.getElementById('totalReturn');
        this.totalProfitElement = document.getElementById('totalProfit');
        this.profitPercentageElement = document.getElementById('profitPercentage');
        this.decreaseTableElement = document.getElementById('decreaseTable');
        this.increaseTableElement = document.getElementById('increaseTable');
    }

    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.calculate());
        
        // 添加输入验证
        [this.mainOddsInput, this.mainAmountInput, this.mainRebateInput, this.subOddsInput, this.subRebateInput].forEach(input => {
            input.addEventListener('input', () => this.validateInputs());
        });
    }

    validateInputs() {
        const mainOdds = parseFloat(this.mainOddsInput.value);
        const mainAmount = parseFloat(this.mainAmountInput.value);
        const mainRebate = parseFloat(this.mainRebateInput.value);
        const subOdds = parseFloat(this.subOddsInput.value);
        const subRebate = parseFloat(this.subRebateInput.value);

        let isValid = true;
        let errorMessage = '';

        if (mainOdds < 1.01) {
            errorMessage += '主盘赔率必须大于1.01\n';
            isValid = false;
        }

        if (mainAmount <= 0) {
            errorMessage += '主盘金额必须大于0\n';
            isValid = false;
        }

        if (mainRebate < 0 || mainRebate > 100) {
            errorMessage += '主盘反水必须在0-100%之间\n';
            isValid = false;
        }

        if (subOdds < 1.01) {
            errorMessage += '副盘赔率必须大于1.01\n';
            isValid = false;
        }

        if (subRebate < 0 || subRebate > 100) {
            errorMessage += '副盘反水必须在0-100%之间\n';
            isValid = false;
        }

        this.calculateBtn.disabled = !isValid;
        this.calculateBtn.style.opacity = isValid ? '1' : '0.6';

        return isValid;
    }

    calculate() {
        if (!this.validateInputs()) {
            this.showError('请检查输入参数是否正确');
            return;
        }

        const mainOdds = parseFloat(this.mainOddsInput.value);
        const mainAmount = parseFloat(this.mainAmountInput.value);
        const mainRebate = parseFloat(this.mainRebateInput.value) / 100;
        const subOdds = parseFloat(this.subOddsInput.value);
        const subRebate = parseFloat(this.subRebateInput.value) / 100;

        try {
            // 计算副盘投注金额
            const subAmount = this.calculateSubAmount(mainOdds, mainAmount, mainRebate, subOdds);
            
            // 计算基础投注方案
            const baseResults = this.calculateBaseResults(mainOdds, mainAmount, mainRebate, subOdds, subAmount, subRebate);
            
            // 计算赔率变化分析
            const variationResults = this.calculateOddsVariation(mainOdds, mainAmount, mainRebate, subOdds, subAmount, subRebate);
            
            // 显示结果
            this.displayResults(baseResults, variationResults);
            
        } catch (error) {
            this.showError('计算出错: ' + error.message);
        }
    }

    calculateSubAmount(mainOdds, mainAmount, mainRebate, subOdds) {
        // 主盘实际收益 = 主盘金额 * 主盘赔率 * (1 + 主盘反水)
        const mainReturn = mainAmount * mainOdds * (1 + mainRebate);
        
        // 副盘投注金额 = 主盘实际收益 / 副盘赔率
        const subAmount = mainReturn / subOdds;
        
        return subAmount;
    }

    calculateBaseResults(mainOdds, mainAmount, mainRebate, subOdds, subAmount, subRebate) {
        const totalInvestment = mainAmount + subAmount;
        
        // 计算主盘和副盘的基本收益
        const mainReturn = mainAmount * mainOdds;
        const subReturn = subAmount * subOdds;
        
        // 计算反水金额
        const mainRebateAmount = mainAmount * mainRebate;
        const subRebateAmount = subAmount * subRebate;
        
        // 计算主盘和副盘的实际收益（基本收益 + 反水金额）
        const mainTotalReturn = mainReturn + mainRebateAmount;
        const subTotalReturn = subReturn + subRebateAmount;
        
        // 总返回金额取两者中的较大值
        const totalReturn = Math.max(mainTotalReturn, subTotalReturn);
        const totalProfit = totalReturn - totalInvestment;
        
        // 计算收益百分比
        const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
        
        return {
            subAmount,
            totalInvestment,
            totalReturn,
            totalProfit,
            profitPercentage,
            mainReturn,
            subReturn,
            mainRebateAmount,
            subRebateAmount,
            mainTotalReturn,
            subTotalReturn
        };
    }

    calculateOddsVariation(mainOdds, mainAmount, mainRebate, subOdds, subAmount, subRebate) {
        const variations = [];
        
        // 计算赔率降低0.01到0.05的情况
        for (let i = 1; i <= 5; i++) {
            const decreaseOdds = subOdds - (i * 0.01);
            if (decreaseOdds >= 1.01) {
                const newSubAmount = this.calculateSubAmount(mainOdds, mainAmount, mainRebate, decreaseOdds);
                const newTotalInvestment = mainAmount + newSubAmount;
                
                // 计算主盘和副盘的基本收益
                const newMainReturn = mainAmount * mainOdds;
                const newSubReturn = newSubAmount * decreaseOdds;
                
                // 计算反水金额
                const newMainRebateAmount = mainAmount * mainRebate;
                const newSubRebateAmount = newSubAmount * subRebate;
                
                // 计算主盘和副盘的实际收益（基本收益 + 反水金额）
                const newMainTotalReturn = newMainReturn + newMainRebateAmount;
                const newSubTotalReturn = newSubReturn + newSubRebateAmount;
                const newTotalReturn = Math.max(newMainTotalReturn, newSubTotalReturn);
                const newTotalProfit = newTotalReturn - newTotalInvestment;
                
                // 计算收益百分比
                const newProfitPercentage = newTotalInvestment > 0 ? (newTotalProfit / newTotalInvestment) * 100 : 0;
                
                variations.push({
                    type: 'decrease',
                    oddsChange: -i * 0.01,
                    newOdds: decreaseOdds,
                    newSubAmount,
                    newTotalInvestment,
                    newTotalReturn,
                    newTotalProfit,
                    newProfitPercentage
                });
            }
        }
        
        // 计算赔率升高0.01到0.05的情况
        for (let i = 1; i <= 5; i++) {
            const increaseOdds = subOdds + (i * 0.01);
            const newSubAmount = this.calculateSubAmount(mainOdds, mainAmount, mainRebate, increaseOdds);
            const newTotalInvestment = mainAmount + newSubAmount;
            
            // 计算主盘和副盘的基本收益
            const newMainReturn = mainAmount * mainOdds;
            const newSubReturn = newSubAmount * increaseOdds;
            
            // 计算反水金额
            const newMainRebateAmount = mainAmount * mainRebate;
            const newSubRebateAmount = newSubAmount * subRebate;
            
            // 计算主盘和副盘的实际收益（基本收益 + 反水金额）
            const newMainTotalReturn = newMainReturn + newMainRebateAmount;
            const newSubTotalReturn = newSubReturn + newSubRebateAmount;
            const newTotalReturn = Math.max(newMainTotalReturn, newSubTotalReturn);
            const newTotalProfit = newTotalReturn - newTotalInvestment;
            
            // 计算收益百分比
            const newProfitPercentage = newTotalInvestment > 0 ? (newTotalProfit / newTotalInvestment) * 100 : 0;
            
            variations.push({
                type: 'increase',
                oddsChange: i * 0.01,
                newOdds: increaseOdds,
                newSubAmount,
                newTotalInvestment,
                newTotalReturn,
                newTotalProfit,
                newProfitPercentage
            });
        }
        
        return variations;
    }

    displayResults(baseResults, variationResults) {
        // 显示基础结果
        this.subAmountElement.textContent = this.formatCurrency(baseResults.subAmount);
        this.totalInvestmentElement.textContent = this.formatCurrency(baseResults.totalInvestment);
        this.mainReturnElement.textContent = this.formatCurrency(baseResults.mainReturn);
        this.subReturnElement.textContent = this.formatCurrency(baseResults.subReturn);
        this.mainRebateAmountElement.textContent = this.formatCurrency(baseResults.mainRebateAmount);
        this.subRebateAmountElement.textContent = this.formatCurrency(baseResults.subRebateAmount);
        this.totalReturnElement.textContent = this.formatCurrency(baseResults.totalReturn);
        
        const profitClass = baseResults.totalProfit > 0 ? 'profit-positive' : 
                           baseResults.totalProfit < 0 ? 'profit-negative' : 'profit-neutral';
        this.totalProfitElement.textContent = this.formatCurrency(baseResults.totalProfit);
        this.totalProfitElement.className = `value ${profitClass}`;
        
        // 显示收益百分比
        this.profitPercentageElement.textContent = this.formatPercentage(baseResults.profitPercentage);
        this.profitPercentageElement.className = `value ${profitClass}`;
        
        // 显示赔率变化分析
        this.displayVariationTable(variationResults.filter(v => v.type === 'decrease'), this.decreaseTableElement);
        this.displayVariationTable(variationResults.filter(v => v.type === 'increase'), this.increaseTableElement);
        
        // 显示结果区域
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayVariationTable(variations, tableElement) {
        if (variations.length === 0) {
            tableElement.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">暂无数据</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>赔率变化</th>
                        <th>新赔率</th>
                        <th>投注金额</th>
                        <th>总投入</th>
                        <th>总返回</th>
                        <th>收益</th>
                        <th>收益率</th>
                    </tr>
                </thead>
                <tbody>
        `;

        variations.forEach(variation => {
            const profitClass = variation.newTotalProfit > 0 ? 'profit-positive' : 
                               variation.newTotalProfit < 0 ? 'profit-negative' : 'profit-neutral';
            
            tableHTML += `
                <tr>
                    <td>${variation.oddsChange > 0 ? '+' : ''}${variation.oddsChange.toFixed(2)}</td>
                    <td>${variation.newOdds.toFixed(2)}</td>
                    <td>${this.formatCurrency(variation.newSubAmount)}</td>
                    <td>${this.formatCurrency(variation.newTotalInvestment)}</td>
                    <td>${this.formatCurrency(variation.newTotalReturn)}</td>
                    <td class="${profitClass}">${this.formatCurrency(variation.newTotalProfit)}</td>
                    <td class="${profitClass}">${this.formatPercentage(variation.newProfitPercentage)}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        tableElement.innerHTML = tableHTML;
    }

    formatCurrency(amount) {
        const formatted = new Intl.NumberFormat('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));
        
        return amount >= 0 ? `+${formatted}` : `-${formatted}`;
    }

    formatPercentage(percentage) {
        const formatted = new Intl.NumberFormat('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(percentage));
        
        return percentage >= 0 ? `+${formatted}%` : `-${formatted}%`;
    }

    showError(message) {
        // 移除之前的错误消息
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // 创建新的错误消息
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // 插入到计算器区域的开头
        const calculatorSection = document.querySelector('.calculator-section');
        calculatorSection.insertBefore(errorDiv, calculatorSection.firstChild);
        
        // 3秒后自动移除错误消息
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }

    showSuccess(message) {
        // 移除之前的成功消息
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        // 创建新的成功消息
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        // 插入到计算器区域的开头
        const calculatorSection = document.querySelector('.calculator-section');
        calculatorSection.insertBefore(successDiv, calculatorSection.firstChild);
        
        // 3秒后自动移除成功消息
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }
}

// 页面加载完成后初始化计算器
document.addEventListener('DOMContentLoaded', () => {
    new FootballArbitrageCalculator();
});
