# Chapter 9: MLR Concepts and Mechanics

---

## 9.1 Introduction

### Core Idea
**Modeling** moves beyond univariate and bivariate analysis to **multivariate analysis**: using multiple features simultaneously to predict an outcome. **Multiple Linear Regression (MLR)** is the foundational modeling technique that quantifies how strongly each feature contributes to the outcome while controlling for the effects of other features.

### The Progression from Bivariate to Multivariate

**Limitations of bivariate analysis:**
- Examines relationships one pair at a time (feature ↔ label).
- Cannot account for **interdependencies** among features.
- Adding individual correlations can overestimate predictive power due to shared variance.

**What modeling provides:**
- Combines multiple features into a single equation.
- Accounts for how features interact and overlap.
- Produces **model training**: using historical data to estimate weights (parameters) for each feature.

### Visualizing the Shift

**Bivariate (2D):** Single predictor (X₁) → Outcome (Y) = a line  
**Multivariate (3D+):** Multiple predictors (X₁, X₂, X₃, ...) → Outcome (Y) = a plane (or hyperplane)

When predicting insurance charges using two features (age and BMI), the fitted model is a **plane in 3D space**. With more features, the model becomes a **multidimensional surface**.

### Two Purposes of MLR

| Purpose | Goal | Focus |
|---|---|---|
| **Causal (Explanatory) Inference** | Understand how changes in features associate with changes in the outcome | Coefficient interpretation, statistical significance, regression assumptions |
| **Predictive Inference** | Generate accurate predictions for new data | Predictive performance, generalization, error metrics |

Same mathematical model, different questions and metrics. This chapter introduces the **causal/explanatory** approach. Prediction-focused workflows come later.

### Key Takeaway
Modeling combines multiple features into a single equation. MLR is the foundational technique because it provides transparency, interpretability, and a clear link between data, assumptions, and decisions. Mastering MLR provides essential intuition for more advanced modeling approaches.

---

## 9.2 Linear Regression

### Core Idea
**Linear regression** finds the equation of a line that minimizes the sum of squared residuals when fitting a dataset. This is a review of simple (bivariate) linear regression to build intuition before extending to multiple features.

### Background Theory

**The familiar equation:** `y = mx + b`
- **m** = slope (rate of change)
- **b** = y-intercept (predicted y when x = 0)

In data analytics, linear regression estimates **how changes in one variable associate with changes in an outcome**, on average, using historical data.

### Key Definitions

**Residual (error):**
```
residual = actual value - predicted value
```
The vertical distance between an observed data point and the regression line.

**Line of best fit / Trendline / Regression line:**
The fitted regression line that provides a predicted y value for each x value.

**Sum of squared residuals:**
Sum of (residual²) for all data points. Linear regression chooses the line that **minimizes** this value.

**Why square residuals?**
1. Negative and positive errors don't cancel out.
2. Larger errors are penalized more heavily.
3. Produces a unique, stable solution that can be computed efficiently.

---

### Model Interpretation

**Example equation:**
```
y = 6000x + 5
```

Where:
- **y** = predicted income
- **6000** = estimated increase in income for each additional year of age (slope)
- **x** = observed age value
- **5** = predicted income when age = 0 (y-intercept)

**Making predictions:**
For a 40-year-old:
```
Predicted income = 6000 × 40 + 5 = $240,005
```

**Do you trust all predictions?**
- Predictions for ages 45-65 may seem reasonable.
- A 5-year-old earning $30,005 is clearly implausible.

**Implications:**
Implausible predictions don't mean regression is useless — they indicate **model assumptions may not hold across all input values**. Evaluating assumptions (linearity, constant variance, appropriate data ranges) is critical before relying on results.

### Key Takeaway
Linear regression uses least-squares estimation to find the line that best fits historical data. Predictions are only trustworthy when the model assumptions are met — a topic addressed later in this chapter and the next.

---

## 9.3 Multiple Linear Regression

### Core Idea
**Multiple Linear Regression (MLR)** extends simple linear regression by allowing **many features** to predict a single outcome simultaneously. This is essential because real-world outcomes are rarely driven by only one factor.

### The MLR Equation

**General form:**
```
y = β₁x₁ + β₂x₂ + β₃x₃ + ... + b
```

**Example:** Predicting income (y) from age (x₁), education (x₂), and work experience (x₃):
```
y = β₁x₁ + β₂x₂ + β₃x₃ + b
```

Each **β coefficient** represents the **conditional effect** of its feature — how much the predicted label changes when that feature increases by one unit **while all other features are held constant**.

**Critical distinction:**
- **Correlation** examines variables in isolation.
- **MLR coefficients** isolate the **unique contribution** of each feature after accounting for overlap with other features.

---

### Why MLR Prevents Misleading Conclusions

**The problem with bivariate correlations:**

Suppose you compute correlations between income and three predictors:
- Age: r = 0.52
- Education: r = 0.42
- Work experience: r = 0.48

**Naive interpretation:** Age is the most important predictor.

**The issue:** These features are correlated with **each other**. Adding correlations (0.52 + 0.48 + 0.42 = 1.42) would imply more than perfect prediction — impossible.

This occurs because **shared information is being double- and triple-counted**. Bivariate correlation cannot distinguish between unique and shared effects.

**MLR's solution:**
Estimates the **true effect** of each feature after accounting for overlap. Individual effects captured by **β coefficients**, overall explanatory power captured by **R²**.

---

### R² (Coefficient of Determination)

**Formula:**
```
R² = 1 - (SSres / SStot)
```

Where:
- **SSres** = Sum of squared residuals (prediction errors)
- **SStot** = Total sum of squares (variance in label)

**Interpretation:**
- R² measures the **proportion of variability in the label explained by all features combined**.
- Range: 0 to 1 (0% to 100% of variance explained).
- Unlike correlation, R² accounts for **shared information** among predictors.

**Example:**
R² = 0.75 means the model explains 75% of the variation in the outcome.

---

### MLR Estimation Process

MLR estimates coefficients by finding the set of values that **minimizes total squared prediction error** across all observations. This is the same **least-squares principle** used in simple regression, but applied in a **higher-dimensional feature space**.

Because humans cannot visualize beyond 3 dimensions, this optimization is performed **mathematically** rather than graphically.

### Key Takeaway
MLR extends simple regression to multiple features. β coefficients isolate unique effects, while R² summarizes overall explanatory power. Together, they form the foundation for interpreting regression models.

---

## 9.4 MLR in Excel

### Core Idea
For students new to MLR, **Excel provides a conceptual sandbox** where model structure, feature estimates, fit metrics, and prediction mechanics are easier to see before introducing Python syntax. This section is optional for those already comfortable with MLR concepts.

### Why Start with Excel?

**Reduces cognitive load:**
- Implementing MLR directly in Python introduces syntax, libraries, and debugging challenges.
- Excel allows you to focus on **concepts** (coefficients, R², multicollinearity) without coding errors.

**Topics covered in Excel practice videos:**
1. Multiple Linear Regression example (basic workflow)
2. Including categorical variables in regression (dummy coding)
3. Skew-transformed regression MLR OLS (handling non-normal features)
4. Multicollinearity and Variance Inflation Factor (VIF)
5. Prediction calculator from MLR OLS results

**Dataset:** `insurance.csv`

### Key Terms

- **MLR:** Multiple Linear Regression
- **OLS:** Ordinary Least Squares (the estimation method)
- **VIF:** Variance Inflation Factor (diagnostic for multicollinearity)

### When to Use Excel

**Recommended if:**
- You're new to MLR and want to build intuition.
- You want to see model structure visually before coding.
- You're struggling with Python syntax and want to separate concept learning from coding.

**Skip if:**
- You're already comfortable with MLR concepts.
- You're confident in Python and want to move directly to implementation.

### Key Takeaway
Excel is a foundational step that can reduce frustration and aid understanding of core MLR concepts. Videos demonstrate categorical encoding, transformations, multicollinearity diagnosis (VIF), and prediction mechanics.

---

## 9.5 MLR in Python

### Core Idea
Now that you understand MLR concepts, replicate the workflow in Python using the **statsmodels** package. The goal is to show how model components (features, coefficients, intercepts, fit metrics) appear programmatically.

---

### Setting Up the Model

**Load data and define label/features:**
```python
import numpy as np
import pandas as pd
import statsmodels.api as sm

df = pd.read_csv('insurance.csv')

# Set label and features
y = df['charges']  # Series (single column)
X = df.select_dtypes(np.number).assign(const=1)  # DataFrame (multiple columns)
X = X.drop(columns=['charges'])
```

**Key decisions:**
1. **y is a Series** (single column: the label).
2. **X is a DataFrame** (multiple columns: the features).
3. Restrict X to **numeric columns** — MLR cannot operate on text data directly.
4. `.assign(const=1)` adds a column of ones to estimate the **y-intercept**.
5. Remove the label from X — including it would trivially produce perfect fit (invalid).

---

### Fitting the Model

```python
model = sm.OLS(y, X)
results = model.fit()
print(results.summary())
```

**Output sections:**

```
                            OLS Regression Results                            
==============================================================================
Dep. Variable:                charges   R-squared:                       0.120
Model:                            OLS   Adj. R-squared:                  0.118
Method:                 Least Squares   F-statistic:                     60.69
Date:                Wed, 12 Feb 2025   Prob (F-statistic):           8.80e-37
Time:                        20:30:40   Log-Likelihood:                -14392.
No. Observations:                1338   AIC:                         2.879e+04
Df Residuals:                    1334   BIC:                         2.881e+04
Df Model:                           3                                         
Covariance Type:            nonrobust                                         
==============================================================================
                 coef    std err          t      P>|t|      [0.025      0.975]
------------------------------------------------------------------------------
age          239.9945     22.289     10.767      0.000     196.269     283.720
bmi          332.0834     51.310      6.472      0.000     231.425     432.741
children     542.8647    258.241      2.102      0.036      36.261    1049.468
const      -6916.2433   1757.480     -3.935      0.000   -1.04e+04   -3468.518
==============================================================================
```

---

### Interpreting Model Fit (Upper Section)

**R-squared:** 0.120 (12% of variance in charges explained by the model)
- Whether this is "good" depends on context and alternative models.

**Adjusted R-squared:** 0.118
- Increases only when a new feature improves the model beyond what would be expected by chance.
- Similarity to R² indicates each feature contributes meaningfully.

**Log-Likelihood (LL), AIC, BIC:**
- Alternative fit metrics that penalize model complexity.
- **LL:** Higher is better.
- **AIC:** Lower is better (balances fit and complexity).
- **BIC:** Lower is better (penalizes complexity more strongly than AIC).

At this stage, primarily rely on **R²** to compare models predicting the same outcome.

---

### In-Sample Predictions and Error Metrics

**In-sample predictions:** Predictions on the same data used to train the model.

```python
df_insample = pd.DataFrame({
    'Actual': df['charges'],
    'Predicted': model.fittedvalues,
    'Residuals': df['charges'] - model.fittedvalues
})
```

**MAE (Mean Absolute Error):** Average absolute prediction error.  
**RMSE (Root Mean Squared Error):** Square root of average squared error (penalizes large errors more).

**CRITICAL LIMITATION:**
In-sample metrics can be **optimistic** — they may make the model appear better than it actually is. The model was trained on this exact data, so good performance is expected.

**Think of it like:** A student retaking the same exam they just practiced on — the second score will be higher because they've already seen the questions.

**Real question:** How well will this model perform on **new, unseen data**?

**In-sample metrics cannot answer this question.**

**Overfitting:** A model might have excellent in-sample RMSE but perform poorly on new data if it has "memorized" patterns specific to training data rather than generalizable relationships.

**Solution (covered later):**
Evaluate on **out-of-sample data** (test set) that was not used during training. This requires train/test splits and cross-validation.

**For now:** Recognize that in-sample metrics are useful for understanding training fit, but **should not be used to claim predictive performance on new data**.

### Key Takeaway
Statsmodels OLS replicates MLR in Python. R² measures overall fit, coefficients represent feature effects, and in-sample metrics (MAE, RMSE) show training performance — but are optimistic and cannot claim generalization to new data.

---

## 9.6 Feature Estimates

### Core Idea
The lower half of the OLS summary contains **feature estimates** — the coefficients, standard errors, t-statistics, p-values, and confidence intervals that quantify each feature's effect on the label.

---

### Coefficients (Feature Weights)

**The `coef` column** shows the **β coefficient** for each feature.

**Interpretation:**
Each coefficient represents the **expected change in the label** associated with a **one-unit increase in the feature**, **holding all other features constant**.

**Critical distinction:**
- Coefficients are **not** simple correlations.
- They are **controlled effects** that isolate the portion of each feature's influence not shared with other predictors.

**Example equation (from insurance data):**
```
charges = 239.99(age) + 332.08(bmi) + 542.86(children) − 6916.24
```

**Making predictions:**
For a 32-year-old with BMI 21 and 2 children:
```python
prediction = model.predict([32, 21, 2, 1])[0]
# Returns predicted charges
```

**Caution at this stage:**
Coefficients should be interpreted as **initial estimates**. They reflect what the model believes about feature effects given the current specification — but are not yet guaranteed to be reliable. Diagnostics (next chapter) determine whether these estimates can be trusted.

---

### Standard Error

**The `std err` column** reports the **standard error** for each coefficient.

**Interpretation:**
- Quantifies **prediction uncertainty** while controlling for other variables.
- Smaller standard errors = more stable estimates.
- Large standard errors often signal multicollinearity or insufficient information.

---

### t-Statistics and p-Values

**t-statistic:**
```
t = coefficient / standard error
```

**Interpretation:**
- Tests whether a coefficient is **statistically distinguishable from zero**.
- Larger absolute t-values = stronger evidence that a feature contributes meaningfully.

**Example (age):**
```
t = 239.9945 / 22.289 = 10.767
```

**p-value (`P>|t|`):**
- Quantifies the probability of observing a coefficient as extreme as the one estimated **if the true effect were zero**.
- Smaller p-values = stronger evidence against the null hypothesis (that the feature has no effect).

**Critical note:**
Raw coefficient magnitudes can be misleading when features are on different scales. Statistical significance (t-statistics and p-values) helps contextualize importance — but these values are only meaningful **if model assumptions hold**.

---

### Confidence Intervals

**The `[0.025, 0.975]` columns** provide a **95% confidence interval** for each coefficient.

**Interpretation:**
If we repeated this study many times, 95% of the confidence intervals would contain the true coefficient value.

**Note:** Diagnostics (next chapter) determine whether these intervals can be trusted.

---

### The Const Term (y-intercept)

**`const`** represents the **y-intercept** — the predicted value of the label when **all features are zero**.

**How it's estimated:**
By including `.assign(const=1)` when defining X, which adds a column of ones.

**Should you force the intercept to zero?**
Rarely. Only if there's a strong theoretical reason (e.g., biased sample data) or after specific transformations (e.g., z-score standardization).

### Key Takeaway
Coefficients are initial estimates of feature effects. Standard errors quantify uncertainty. t-statistics and p-values test significance. At this stage, treat all estimates as **provisional** — diagnostics in the next chapter determine reliability.

---

## 9.7 Categorical Variables

### Core Idea
MLR requires **numeric inputs**. To include categorical variables, convert them into **dummy codes** (0/1 indicator variables). One category per feature must be dropped to avoid **perfect multicollinearity**.

---

### Dummy Coding Basics

**Manual approach:**
```python
df = pd.get_dummies(df, columns=['sex', 'smoker', 'region'])
```

**Automated approach:**
```python
# Identify all categorical columns dynamically
dummies = df.select_dtypes(['object']).columns
df = pd.get_dummies(df, columns=dummies)
```

**Note:** `.get_dummies()` may return **True/False** instead of **1/0** (depends on Pandas version).
- **Statsmodels** requires 1/0.
- **sklearn** allows True/False.

**Converting True/False to 1/0:**
```python
X[X.select_dtypes(bool).columns] = X.select_dtypes(bool).astype(int)
```

---

### The Perfect Multicollinearity Problem

**Problem:**
If you include dummy variables for **all categories** of a feature (e.g., `smoker_no` and `smoker_yes`), they provide the same information.

**Example:**
- If `smoker_yes = 1`, then `smoker_no = 0` (guaranteed).
- If `smoker_yes = 0`, then `smoker_no = 1` (guaranteed).

This creates **perfect multicollinearity** — one variable is a perfect linear combination of another. The model cannot estimate unique effects.

**Symptoms:**
- Extremely high condition number (e.g., 7.13e+17).
- Warning: "design matrix is singular" or "strong multicollinearity problems."

---

### Solution: Drop the First Category

**Use `drop_first=True`:**
```python
df = pd.get_dummies(df, columns=df.select_dtypes(['object']).columns, drop_first=True)
```

**What this does:**
For each categorical feature, one category becomes the **reference group** (omitted). All other categories are compared **relative to the reference**.

**Example (smoker):**
- Reference group: `smoker_no` (omitted)
- Dummy variable: `smoker_yes` (1 if yes, 0 if no)

**Interpretation:**
The coefficient for `smoker_yes` represents the **difference in predicted charges** between smokers and non-smokers (the reference group).

---

### Testing the Model with Dummy Codes

**Before dropping first:**
- Condition number: 7.13e+17 (severe multicollinearity)
- Warning messages about singular matrix

**After dropping first:**
- Condition number: ~311 (acceptable)
- No redundancy warnings
- R² unchanged (same overall fit)
- Coefficients now interpretable relative to reference groups

**Performance improvement:**
```python
# Before (numeric features only):
MAE:  $9000+
RMSE: $11000+

# After (with categorical features, drop_first=True):
MAE:  $4170.89
RMSE: $6041.68
```

Substantial improvement in prediction accuracy.

### Key Takeaway
Convert categorical variables to dummy codes using `pd.get_dummies()`. Always use `drop_first=True` to avoid perfect multicollinearity. Each dummy coefficient is interpreted **relative to the reference group** (the omitted category).

---

## 9.8 Feature Scaling

### Core Idea
**Feature scaling** adjusts the numeric range of features so they can be **meaningfully compared** within a regression model. MLR can be estimated without scaling, but scaling improves **coefficient comparability** and prepares data for algorithms sensitive to feature magnitude.

**Critical distinction:** Scaling is an **interpretive tool**, not a corrective step. It does not fix violated assumptions (non-linearity, heteroscedasticity, multicollinearity).

---

### Terminology

**Feature scaling:** Changes units of measurement but preserves underlying relationships.

**Normalization (min-max):** Rescales values to fall between 0 and 1.  
**Standardization (z-score):** Rescales values to have mean = 0 and standard deviation = 1.

**Important:** Although these terms are sometimes used interchangeably, they are **mathematically distinct** and serve different purposes.

---

### Which Features to Scale?

**Scale:**
- **Continuous numeric variables** (age, BMI, income, temperature).

**Do NOT scale:**
- **Dummy-coded categorical variables** (0/1 indicators).

**Why not scale dummy variables?**
- A value of 0 or 1 already represents a **complete and meaningful unit change**: membership vs. non-membership in a category.
- Scaling would replace clear category membership with fractional values that have no real-world meaning.
- Dummy coefficients are interpreted **relative to a reference group** — preserving 0/1 structure ensures interpretation remains valid.

---

### Standardization (Z-Score Scaling)

**What it does:**
Converts numeric predictors into z-scores by subtracting the mean and dividing by the standard deviation.

**Result:**
- Mean = 0
- Standard deviation = 1

**Interpretation after scaling:**
Coefficients represent the expected change in the label associated with a **one standard deviation increase** in the predictor, holding all other variables constant.

```python
from sklearn import preprocessing

numeric_cols = ["age", "bmi", "children"]
df_zscore = df.copy()
df_zscore[numeric_cols] = preprocessing.StandardScaler().fit_transform(df_zscore[numeric_cols])
```

**Note:** In causal modeling, **do not scale the label**. Scaling the label is reserved for prediction-focused workflows. Otherwise, coefficients won't be in meaningful units.

---

### Min-Max Normalization

**What it does:**
Rescales numeric predictors to a fixed range between 0 and 1.

**Result:**
- Minimum value → 0
- Maximum value → 1

**Interpretation after scaling:**
Coefficients represent the expected change in the label associated with moving from the **minimum to maximum observed value** of the predictor.

```python
df_minmax = df.copy()
df_minmax[numeric_cols] = preprocessing.MinMaxScaler().fit_transform(df_minmax[numeric_cols])
```

---

### Effect on Regression Interpretation

**What scaling does NOT change:**
- R²
- F-statistics
- Residual patterns
- Statistical significance (p-values)

These quantities depend on **underlying relationships in the data**, not units of measurement.

**What scaling DOES change:**
- **Coefficient magnitude** (larger or smaller depending on scaling method).
- **Interpretability** (coefficients now comparable across features).

**Example (Min-Max scaling):**

```python
# After scaling numeric features (age, bmi, children) but not dummy codes:
model = sm.OLS(y, X).fit()
print(model.summary())

# age coefficient:       11,820  (effect of moving from min to max age)
# bmi coefficient:       12,610  (effect of moving from min to max BMI)
# children coefficient:   2,378  (effect of moving from min to max children)
```

Now you can meaningfully compare: BMI has a larger effect than age, which has a larger effect than children.

**In the unscaled model:**
The larger coefficient for children reflected **differences in measurement units**, not a stronger relationship.

---

### When to Scale

**Scenarios where scaling helps:**
1. **Comparing coefficient magnitudes** across features (which predictor has the strongest effect?).
2. **Algorithms sensitive to feature magnitude** (e.g., regularized regression, neural networks, k-means clustering).
3. **Interpreting effects in standard deviation units** (standardization) or min-max units (normalization).

**Scenarios where scaling is NOT necessary:**
1. **You only care about direction and significance** (not magnitude comparison).
2. **Features are already on similar scales**.
3. **Model outputs are sufficient without cross-feature comparison**.

### Key Takeaway
Scaling alters measurement units but does not change underlying relationships. Use standardization (z-score) or min-max normalization to improve coefficient comparability. Never scale dummy-coded variables. Coefficients remain **provisional** until diagnostics are performed (next chapter).

---

## 9.9 Summary

### What MLR Provides

MLR estimates the **independent association** between each feature and the label while **controlling for the presence of other features**. This makes MLR especially valuable for:
- **Causal reasoning** (understanding direction and magnitude of effects).
- **Decision support** (identifying which features matter most).

Using **Statsmodels OLS**, you learned how to:
- Define features (X) and labels (y).
- Fit a regression model.
- Interpret output: coefficients, standard errors, t-statistics, p-values, R², AIC, BIC.

---

### Feature Estimates as a Starting Point

**Regression coefficients** provide an **initial estimate** of how changes in each feature are associated with changes in the outcome, holding all other features constant.

**At this stage, treat estimates as provisional:**
- They are mathematically correct given the fitted model.
- Their **reliability** depends on assumptions that have not yet been fully evaluated or corrected.

**Next chapter:**
Diagnostics will determine whether coefficients can be trusted for strong claims or downstream decisions.

---

### Preparing Features for Modeling

**Categorical variables:**
- MLR requires numeric inputs.
- Convert categorical variables to **dummy codes** using `pd.get_dummies()`.
- Use `drop_first=True` to remove one category per feature (reference group) and avoid perfect multicollinearity.

**Feature scaling:**
- Standardization (z-score): Coefficients represent one standard deviation changes.
- Min-max normalization: Coefficients represent min-to-max changes.
- Scaling improves **coefficient comparability** but does not fix violated assumptions.
- **Never scale dummy-coded variables** — preserve 0/1 structure for valid interpretation.

---

### A Deliberate Pause Before Trust

**You examined:**
- Model fit statistics (R², Adjusted R², AIC, BIC).
- Feature estimates (coefficients, standard errors, t-statistics, p-values).

**You did NOT evaluate:**
- Normality
- Multicollinearity
- Autocorrelation
- Linearity
- Homoscedasticity

**This pause is deliberate.**

Before coefficients can be **trusted for strong claims or downstream decisions**, the model must be evaluated for assumption violations. These diagnostics — and the adjustments they motivate — are addressed in **Chapter 10**.

---

### Where This Leads

**By the end of this chapter, you should be comfortable:**
- Building an initial regression model.
- Interpreting model output.
- Recognizing the model's limitations.

**In the next chapter, you will:**
- Revisit regression models with a **critical lens**.
- Apply **diagnostics** (VIF, residual plots, normality tests).
- Apply **transformations** (log, sqrt, Yeo-Johnson).
- Apply **refinements** (remove features, address outliers).

This process allows feature estimates to move from **suggestive** to **defensible**, and ultimately prepares the model for predictive use.

### Key Takeaway
This chapter introduced MLR mechanics: fitting models, interpreting coefficients, encoding categorical variables, and scaling features. All estimates are provisional until validated with diagnostics in the next chapter.

---

## 9.10 Case Studies

### Core Idea
Three practice assessments using new datasets to rehearse the complete MLR workflow: building models, interpreting fit statistics and coefficients, and answering targeted analysis questions.

**For each dataset:**
1. Load and inspect data (rows/columns, data types, summary stats).
2. Fit an MLR model using numeric and/or categorical predictors.
3. Record fit metrics (R², Adjusted R²).
4. Identify most significant predictors (t-values, p-values).
5. (Optional) Compute standardized coefficients and compare magnitudes.

---

### Case #1: Diamonds Dataset

**Dataset:** `seaborn.load_dataset("diamonds")` (built-in to Seaborn package)  
**Label:** `price`  
**Predictors:**
- Numeric: `carat`, `depth`, `table`, `x`, `y`, `z`
- Categorical: `cut`, `color`, `clarity`

**Tasks:**
1. Inspect dataset (rows, columns, data types).
2. Fit OLS MLR predicting `price`.
3. Record R² and Adjusted R².
4. Identify predictor with smallest p-value.
5. Identify numeric predictor with largest absolute t-value.
6. For one categorical variable, identify the level that increases predicted price the most relative to the reference group.
7. (Optional) Standardize numeric predictors and identify largest standardized coefficient.

**Sample Answers:**
- **Rows/columns:** 53,940 rows, 10 columns
- **Mean price:** $3,932.80
- **R²:** 0.9198, Adjusted R²: 0.9197
- **Smallest p-value:** `carat` (p ≈ 0.000)
- **Largest t-value (numeric):** `carat` (t = 231.49)
- **Categorical increase (cut):** `cut_Ideal` (coef = 832.91)
- **Largest standardized coef:** `carat` (5335.88)

---

### Case #2: Red Wine Quality Dataset

**Dataset:** `winequality-red.csv` (UCI Machine Learning Repository)  
**Label:** `quality`  
**Predictors:** All other columns (numeric only — no categorical variables)

**Tasks:**
1. Inspect dataset (rows, columns, data types).
2. Fit OLS MLR predicting `quality` using all numeric predictors.
3. Record R² and Adjusted R².
4. Identify predictor with smallest p-value.
5. Identify predictor with largest absolute t-value.
6. Identify predictor with largest positive coefficient.
7. (Optional) Standardize numeric predictors and identify largest standardized coefficient magnitude.

**Sample Answers:**
- **Rows/columns:** 1,599 rows, 12 columns
- **Mean quality:** 5.64
- **R²:** 0.3606, Adjusted R²: 0.3561
- **Smallest p-value:** `alcohol` (p ≈ 0.000)
- **Largest t-value:** `alcohol` (t = 10.43)
- **Largest positive coef:** `sulphates` (coef = 0.9163)
- **Largest standardized coef:** `alcohol` (0.2942)

---

### Case #3: Bike Sharing Daily Dataset

**Dataset:** `day.csv` (UCI Bike Sharing Dataset)  
**Label:** `cnt` (total daily rentals)  
**Predictors:**
- Numeric: `temp`, `atemp`, `hum`, `windspeed`
- Binary: `yr`, `holiday`, `workingday`
- Categorical: `season`, `mnth`, `weekday`, `weathersit`

**Critical note:** Do NOT include `casual` or `registered` as predictors — they directly sum to `cnt` and would leak the answer.

**Tasks:**
1. Inspect dataset (rows, columns, summary stats for `cnt`).
2. Dummy-code categorical predictors using `drop_first=True`.
3. Fit OLS MLR predicting `cnt`.
4. Record R² and Adjusted R².
5. Identify predictor with smallest p-value.
6. Among numeric predictors, identify largest absolute t-value.
7. For `weathersit`, identify category level that decreases `cnt` the most.
8. (Standardized) Standardize numeric predictors (but not dummy codes), identify largest and smallest standardized coefficient magnitudes.
9. Based on standardized coefficients, name one "best" feature (large magnitude) and one "worst" feature (small magnitude) for informal predictions.

**Sample Answers:**
- **Rows/columns:** 731 rows, 16 columns
- **Mean cnt:** 4,504.35
- **R²:** 0.8381, Adjusted R²: 0.8312
- **Smallest p-value:** `yr` (p ≈ 0.000)
- **Largest t-value (numeric):** `yr` (t = 34.69)
- **Largest decrease (weathersit):** `weathersit_3` (coef = -2409.68)
- **Largest standardized coef:** `yr` (1738.95)
- **Smallest standardized coef:** `workingday` (17.09)
- **"Best" feature:** `yr` (very large effect size)
- **"Worst" feature:** `workingday` (very small effect size)

---

### Key Takeaway
Case studies rehearse the complete MLR workflow across diverse datasets with different feature types (numeric-only, categorical-heavy, mixed). Practice builds fluency in model fitting, interpretation, and coefficient comparison.
