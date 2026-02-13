# Chapter 8: Automating Relationship Discovery

---

## 8.1 Introduction

### Core Idea
Bivariate analysis examines **relationships between two variables** rather than the distribution of a single variable. The key difference from univariate automation: one variable is the **label** (target/outcome), and the other is a **feature**. Identifying the label correctly is essential because it determines which analyses are meaningful and limits unnecessary comparisons.

### The Question Shifts
- **Univariate:** "What does this variable look like?"
- **Bivariate:** "How does this variable relate to the outcome?"

### The Four Relationship Types
Bivariate analyses are categorized by **data type combinations** (feature × label):

| Relationship Type | Feature Type | Label Type | Primary Statistic | Primary Visualization |
|---|---|---|---|---|
| **N2N** | Numeric | Numeric | Pearson's r (correlation) | Scatterplot with trendline |
| **C2N / N2C** | Categorical | Numeric (or vice versa) | F-statistic (ANOVA) | Bar chart with error bars |
| **C2C** | Categorical | Categorical | χ² (chi-square) | Heat map (crosstab) |

A well-designed bivariate function uses this structure as a **decision tree**: determine data types → select appropriate test and visualization.

### Principles from Chapter 6 (Applied to Bivariate)
1. **Automated** — Reduces repetition by iterating through all features.
2. **Dynamic** — Adapts to different data types and datasets.
3. **Error-resistant** — Handles missing data, validates inputs, prevents crashes.

### What's Different in Chapter 8
Compared to univariate automation, bivariate automation requires **more careful decision-making** because the choice of statistic and visualization must match **both** variables involved. This chapter extends your automation skills by building functions that correctly identify relationship types, select appropriate tests/charts, and incorporate data validation.

### Key Takeaway
Bivariate analysis is relationship-driven. Once you know the data types (N or C for feature and label), the appropriate test and chart follow logically. Automation makes this systematic and scalable.

---

## 8.2 Statistics Function

### Core Idea
A bivariate statistics function iterates through features, identifies relationship types, and computes the appropriate statistical test. Start with **N2N relationships** (Pearson's r, regression line, p-value), then expand to other types.

### The Eight-Step Automation Pattern (Recap)
1. Define the automation function.
2. Import Python packages.
3. Create variables needed for processing.
4. Define the iteration (e.g., loop through features).
5. Perform processing required for every iteration.
6. Define the decision criterion (data type check).
7. Perform processing required in each branch.
8. Perform any final synthesis or cleanup.

We move faster in this chapter because you've already learned the mechanics in Chapter 6.

---

### Numeric-to-Numeric (N2N) Statistics

When both feature and label are numeric, compute:
- **Pearson's r** — Linear correlation coefficient.
- **Regression line** — `y = m(x) + b`.
- **p-value** — Statistical significance.

**Baseline function:**
```python
def bivariate_stats(df, label, roundto=4):
    import pandas as pd
    from scipy import stats
    
    output_df = pd.DataFrame(columns=['p', 'r', 'y = m(x) + b'])
    
    for feature in df.columns:
        if feature != label:
            if pd.api.types.is_numeric_dtype(df[feature]):
                m, b, r, p, err = stats.linregress(df[feature], df[label])
                output_df.loc[feature] = [
                    round(p, roundto),
                    round(r, roundto),
                    f'y = {round(m, roundto)}(x) + {round(b, roundto)}'
                ]
    
    return output_df
```

**Test:**
```python
bivariate_stats(df_insurance, 'charges', 3)
```

**What it does:**
1. Iterates through all columns except the label.
2. Checks if the feature is numeric.
3. Computes Pearson correlation, regression line, and p-value.
4. Stores results in a DataFrame.

**Why only numeric features?**
Correlation cannot be computed on categorical (text) values — the function gracefully skips them.

### Future Extensions
Later, you can add:
- **Kendall's tau (τ)** — For rank-ordered/ordinal data.
- **Spearman's rho (ρ)** — For non-normally distributed data or non-linear relationships.
- **Skewness** — To help analysts decide which correlation metric to use.

### Key Takeaway
Start simple (Pearson's r for N2N), test thoroughly, then extend. The function is fully automated, dynamic, and error-resistant (gracefully handles non-numeric features).

---

## 8.3 Visualization Functions

### Core Idea
Rather than one monolithic function, create **separate visualization functions** for each relationship type (N2N, C2N/N2C, C2C). This improves **reusability** (use each function in multiple places) and **maintainability** (update logic in one place).

---

### Numeric-to-Numeric (N2N): Scatterplots

**Goal:** Generate a scatterplot with a trendline and embed key statistics (regression equation, r, r², p, n) directly on the chart.

**Why embed stats?**
So you can interpret strength, direction, and significance in the same place you view the chart — no need to cross-reference a separate table.

```python
def scatterplot(df, feature, label, roundto=3, linecolor='darkorange', title=None, savepath=None, show=True):
    import pandas as pd
    from matplotlib import pyplot as plt
    import seaborn as sns
    from scipy import stats
    
    if feature == label:
        raise ValueError('feature and label must be different.')
    
    # Handle missing data
    df_temp = df[[feature, label]].dropna()
    if df_temp.shape[0] < 3:
        raise ValueError('Not enough non-missing rows to plot and compute regression.')
    
    ax = plt.gca()
    
    # Create the plot
    sns.regplot(data=df_temp, x=feature, y=label, ax=ax, line_kws={'color': linecolor})
    
    # Calculate regression statistics
    m, b, r, p, err = stats.linregress(df_temp[feature], df_temp[label])
    
    # Build annotation text
    textstr  = 'Regression line:\n'
    textstr += f'y = {round(m, roundto)}x + {round(b, roundto)}\n'
    textstr += f'r = {round(r, roundto)}\n'
    textstr += f'r2 = {round(r**2, roundto)}\n'
    textstr += f'p = {round(p, roundto)}\n'
    textstr += f'n = {df_temp.shape[0]}'
    
    if title is None:
        title = f'{feature} vs. {label}'
    ax.set_title(title)
    
    # Anchor text to axes
    ax.text(1.02, 0.02, textstr, fontsize=11, transform=ax.transAxes, va='bottom')
    
    if savepath is not None:
        plt.savefig(savepath, bbox_inches='tight', dpi=200)
    if show:
        plt.show()
    
    return ax
```

**Test:**
```python
scatterplot(df_insurance, 'age', 'charges')
scatterplot(df_insurance, 'bmi', 'charges')
```

**Key features:**
- **Missing data handling** — Drops missing rows internally.
- **Input validation** — Ensures feature ≠ label; ensures enough rows.
- **Embedded stats** — Regression line, r, r², p, n all visible on chart.
- **Optional save** — `savepath` parameter allows saving to file.

---

### Categorical-to-Numeric (C2N/N2C): Bar Charts

**Goal:** Generate a bar chart comparing means across categories, with ANOVA F-statistic, p-value, and pairwise t-tests (Bonferroni-corrected).

**Key design decision:** The function automatically swaps inputs so the categorical variable always appears on the x-axis.

```python
def bar_chart(df, feature, label, roundto=3, title=None, savepath=None, show=True):
    import pandas as pd
    from scipy import stats
    from matplotlib import pyplot as plt
    import seaborn as sns
    
    if feature == label:
        raise ValueError('feature and label must be different.')
    
    # Ensure categorical on x-axis, numeric on y-axis
    is_num_feature = pd.api.types.is_numeric_dtype(df[feature])
    is_num_label = pd.api.types.is_numeric_dtype(df[label])
    
    if is_num_feature and not is_num_label:
        num = feature
        cat = label
    elif not is_num_feature and is_num_label:
        num = label
        cat = feature
    else:
        raise ValueError('bar_chart requires one numeric and one categorical variable.')
    
    # Handle missing data
    df_temp = df[[cat, num]].dropna()
    if df_temp[cat].nunique() < 2:
        raise ValueError('Not enough categories to compare (need at least 2).')
    
    ax = plt.gca()
    sns.barplot(data=df_temp, x=cat, y=num, ax=ax, errorbar=None)
    
    # One-way ANOVA
    groups = list(df_temp[cat].unique())
    group_lists = [df_temp[df_temp[cat] == g][num] for g in groups]
    results = stats.f_oneway(*group_lists)
    F = results[0]
    p_anova = results[1]
    
    # Pairwise t-tests with Bonferroni correction
    ttests = []
    for i1, g1 in enumerate(groups):
        for i2, g2 in enumerate(groups):
            if i2 > i1:
                vals_1 = df_temp[df_temp[cat] == g1][num]
                vals_2 = df_temp[df_temp[cat] == g2][num]
                t, p = stats.ttest_ind(vals_1, vals_2, equal_var=False, nan_policy='omit')
                ttests.append([f'{g1} - {g2}', round(t, roundto), round(p, roundto)])
    
    p_threshold = 0.05 / max(1, len(ttests))  # Bonferroni correction
    
    # Annotation text
    textstr  = 'ANOVA\n'
    textstr += f'F: {round(F, roundto)}\n'
    textstr += f'p: {round(p_anova, roundto)}\n'
    textstr += f'n: {df_temp.shape[0]}\n\n'
    
    for ttest in ttests:
        if ttest[2] <= p_threshold:
            if 'Sig. comparisons (Bonferroni)' not in textstr:
                textstr += 'Sig. comparisons (Bonferroni)\n'
            textstr += f'{ttest[0]}: t={ttest[1]}, p={ttest[2]}\n'
    
    if title is None:
        title = f'{num} by {cat}'
    ax.set_title(title)
    
    ax.text(1.02, 0.02, textstr, fontsize=10.5, transform=ax.transAxes, va='bottom')
    
    if savepath is not None:
        plt.savefig(savepath, bbox_inches='tight', dpi=200)
    if show:
        plt.show()
    
    return ax
```

**Test:**
```python
bar_chart(df_insurance, 'region', 'charges')
bar_chart(df_insurance, 'smoker', 'charges')
```

**Key features:**
- **Automatic swapping** — Ensures categorical on x-axis regardless of argument order.
- **ANOVA + pairwise t-tests** — Shows overall effect and which groups differ.
- **Bonferroni correction** — Reduces false positives when comparing multiple groups.
- **Missing data handling** — Drops missing rows internally.

**Future improvement:** Bin rare categories (< 5% of data) into "Other" to reduce visual clutter and reduce number of t-tests.

---

### Categorical-to-Categorical (C2C): Heat Maps

**Goal:** Generate a crosstab heat map showing observed counts, with chi-square (χ²) test of independence.

**Helper function for binning:**
```python
def bin_categories(df, feature, cutoff=0.05, replace_with='Other'):
    import pandas as pd
    
    df_out = df.copy()
    
    proportions = df_out[feature].value_counts(dropna=True) / df_out[feature].dropna().shape[0]
    other_list = proportions[proportions < cutoff].index
    
    df_out.loc[df_out[feature].isin(other_list), feature] = replace_with
    
    return df_out
```

**Main crosstab function:**
```python
def crosstab(df, feature, label, roundto=3, cutoff=0.05, title=None, savepath=None, show=True):
    import pandas as pd
    from scipy.stats import chi2_contingency
    from matplotlib import pyplot as plt
    import seaborn as sns
    
    if feature == label:
        raise ValueError('feature and label must be different.')
    
    # Handle missing data
    df_temp = df[[feature, label]].dropna()
    if df_temp.shape[0] == 0:
        raise ValueError('No non-missing rows available for this pair.')
    
    # Bin rare categories
    df_temp = bin_categories(df_temp, feature, cutoff=cutoff)
    
    # Observed counts
    ct = pd.crosstab(df_temp[feature], df_temp[label])
    
    # Chi-square test
    X2, p, dof, expected = chi2_contingency(ct)
    
    ax = plt.gca()
    sns.heatmap(ct, annot=True, fmt='d', ax=ax)
    
    if title is None:
        title = f'{feature} vs. {label}'
    ax.set_title(title)
    
    textstr  = f'X2: {round(X2, roundto)}\n'
    textstr += f'p: {round(p, roundto)}\n'
    textstr += f'dof: {dof}\n'
    textstr += f'n: {df_temp.shape[0]}'
    
    ax.text(1.02, 0.02, textstr, fontsize=10.5, transform=ax.transAxes, va='bottom')
    
    if savepath is not None:
        plt.savefig(savepath, bbox_inches='tight', dpi=200)
    if show:
        plt.show()
    
    return ax
```

**Test:**
```python
crosstab(df_housing, 'Neighborhood', 'OverallCond')
```

**Key features:**
- **Automatic binning** — Groups rare categories into "Other" (configurable cutoff).
- **Chi-square test** — Tests independence between categorical variables.
- **Heat map** — Visual representation of observed counts.

### Key Takeaway
Build separate, reusable functions for each visualization type. This modular design improves maintainability and allows you to call each function independently or integrate them into a controller.

---

## 8.4 Controller Function

### Core Idea
The **controller function** ties everything together: it iterates through features, identifies relationship types (N2N, C2N/N2C, C2C), computes statistics, and calls the matching visualization function. This creates a **complete, automated bivariate EDA workflow**.

### The Controller's Job
1. Iterate through all features (except the label).
2. For each feature:
   - Handle missing data.
   - Determine relationship type (check data types).
   - Compute appropriate statistics.
   - Call matching visualization function.
3. Return a summary table sorted by p-value.

---

### Implementation

```python
def bivariate(df, label, roundto=4, viz=True):
    import pandas as pd
    from scipy import stats
    
    output_df = pd.DataFrame(
        columns=['missing', 'p', 'r', 'τ', 'ρ', 'y = m(x) + b', 'F', 'X2', 'skew', 'unique', 'values']
    )
    
    for feature in df.columns:
        if feature != label:
            # Work with temp 2-column slice for consistent missing-data handling
            df_temp = df[[feature, label]].dropna()
            
            missing = (df.shape[0] - df_temp.shape[0]) / df.shape[0]
            unique = df_temp[feature].nunique()
            
            # Bin categories on temp slice (not global df)
            if not pd.api.types.is_numeric_dtype(df_temp[feature]):
                df_temp = bin_categories(df_temp, feature)
            
            if not pd.api.types.is_numeric_dtype(df_temp[label]):
                df_temp = bin_categories(df_temp, label)
            
            # N2N: numeric label and numeric feature
            if pd.api.types.is_numeric_dtype(df_temp[feature]) and pd.api.types.is_numeric_dtype(df_temp[label]):
                m, b, r, p, err = stats.linregress(df_temp[feature], df_temp[label])
                tau, tp = stats.kendalltau(df_temp[feature], df_temp[label])
                rho, rp = stats.spearmanr(df_temp[feature], df_temp[label])
                
                output_df.loc[feature] = [
                    f'{missing:.2%}', round(p, roundto), round(r, roundto), round(tau, roundto),
                    round(rho, roundto), f'y = {round(m, roundto)}(x) + {round(b, roundto)}',
                    '-', '-', df_temp[feature].skew(), unique, '-'
                ]
                
                if viz:
                    scatterplot(df_temp, feature, label, roundto)
            
            # C2C: categorical label and categorical feature
            elif (not pd.api.types.is_numeric_dtype(df_temp[feature])) and (not pd.api.types.is_numeric_dtype(df_temp[label])):
                contingency_table = pd.crosstab(df_temp[feature], df_temp[label])
                X2, p, dof, expected = stats.chi2_contingency(contingency_table)
                
                output_df.loc[feature] = [
                    f'{missing:.2%}', round(p, roundto), '-', '-', '-', '-', '-', round(X2, roundto),
                    '-', unique, df_temp[feature].unique()
                ]
                
                if viz:
                    crosstab(df_temp, feature, label, roundto)
            
            # C2N / N2C: one numeric, one categorical
            else:
                if pd.api.types.is_numeric_dtype(df_temp[feature]):
                    skew = df_temp[feature].skew()
                    num = feature
                    cat = label
                else:
                    skew = '-'
                    num = label
                    cat = feature
                
                groups = df_temp[cat].unique()
                group_lists = [df_temp[df_temp[cat] == g][num] for g in groups]
                
                results = stats.f_oneway(*group_lists)
                F = results[0]
                p = results[1]
                
                output_df.loc[feature] = [
                    f'{missing:.2%}', round(p, roundto), '-', '-', '-', '-', round(F, roundto), '-', skew,
                    unique, df_temp[cat].unique()
                ]
                
                if viz:
                    bar_chart(df_temp, cat, num, roundto)
    
    return output_df.sort_values(by=['p'])
```

---

### What the Controller Accomplishes
- **Unified workflow** — One function call produces statistics + visualizations for all features.
- **Consistent missing-data handling** — Works on temp slices, doesn't mutate original data.
- **Automatic relationship detection** — Uses data types to determine N2N, C2N, N2C, or C2C.
- **Comprehensive statistics** — Pearson r, Kendall τ, Spearman ρ (N2N); F-statistic (C2N/N2C); χ² (C2C).
- **Sorted output** — Results sorted by p-value (most significant first).

---

### Test the Controller

```python
bivariate(df_insurance, 'charges')
# Produces: statistics table + scatterplots for numeric features + bar charts for categorical features

bivariate(df_airline, 'satisfaction')
# Produces: statistics table + appropriate visualizations for all relationship types

bivariate(df_housing, 'SalePrice')
# Produces: comprehensive EDA output for housing data
```

---

### Saving and Reusing Functions

Save your best automation functions in an external `.py` file:

```python
import sys
sys.path.append('/content/drive/MyDrive/Colab Notebooks/class/IS455/In-class notebooks')
import functions as fun

fun.bivariate(df_insurance, "charges")
```

### Key Takeaway
The controller function is the culmination of modular design: it orchestrates statistics computation and visualization calls, producing a complete automated EDA workflow you can run on almost any dataset with minimal effort.

---

## 8.5 Practice

### Core Idea
These practice problems extend the bivariate automation functions by adding validity checks, improved binning logic, and effect size interpretation.

---

### Practice 1: Improve N2N Statistics

**Problem:**
The `bivariate_stats` function computes Pearson's r, but doesn't tell you whether it's **valid**. Pearson's r assumes both feature and label are normally distributed. What if they aren't?

**Task:**
Modify the function to also calculate:
- **Kendall's tau (τ)** — Best for rank-ordered/ordinal data.
- **Spearman's rho (ρ)** — Best when data are not normally distributed or the relationship is non-linear.

Add these columns next to Pearson r. Also add:
- **Skewness** of each numeric feature.
- **Count of unique values** in each feature.

These help the analyst decide which correlation metric to use.

**Test:**
Use the housing dataset to predict `SalePrice` as the label.

**Expected output columns:**
`['p', 'r', 'τ', 'ρ', 'y = m(x) + b', 'skew', 'unique']`

---

### Practice 2: Improve Categorical Binning

**Problem:**
The 5% rule for binning rare categories is a rough guideline. For very large datasets, 4% might still be 50+ records — enough to analyze. The current `bin_categories()` function only checks percentage.

**Task:**
Modify `bin_categories()` to include **both** a percent cutoff and a numeric count cutoff. Only bin a category if it's **BOTH** below the percent threshold **AND** below the count threshold.

Example parameters:
```python
bin_categories(df, feature, cutoff_pct=0.05, cutoff_n=50, replace_with='Other')
```

**Test:**
Use the housing dataset with the `Neighborhood` feature. Print `value_counts()` before and after binning, showing both counts and percentages.

**Expected behavior:**
More neighborhoods are kept (not binned into "Other") because they have enough rows (>50) even though their percentages are <5%.

---

### Practice 3: Interpreting Effect Size Beyond Statistical Significance

**Problem:**
P-values alone don't measure the **magnitude** or **practical importance** of an effect. A relationship can be statistically significant (low p-value) but have a tiny effect size (not practically meaningful).

**Task:**

**Part 1: Written Summary**
Explain how an analyst should interpret each pair together:
- **p-value and Pearson r** (N2N relationships)
- **p-value and F-statistic** (C2N/N2C relationships)
- **p-value and χ² statistic** (C2C relationships)

Clearly distinguish between **statistical significance** (p-value) and **practical significance** (effect size).

**Part 2: Code Enhancement**
Modify the `bivariate` or `bivariate_stats` function to include a new column called `effect_size_note`. This column should contain a qualitative label:
- "small effect"
- "moderate effect"
- "large effect"

Based on commonly accepted thresholds (e.g., Cohen's conventions for r, or standard guidelines for F and χ²).

**Suggested thresholds (Cohen's conventions for r):**
- Small: |r| ≥ 0.1
- Moderate: |r| ≥ 0.3
- Large: |r| ≥ 0.5

**Test:**
Use the housing dataset with `SalePrice` as the label. Verify that the added column helps prioritize features that are **both** statistically significant **and** practically meaningful.

**Hint:** You may use AI to help research effect size guidelines and translate them into code — just make sure you understand the logic.

---

### Key Takeaway
Practice problems push you beyond baseline automation into **statistical validity**, **adaptive binning**, and **effect size interpretation** — all essential for production-quality EDA.
