# PREVENT Calculator API
# Wraps the official preventr CRAN package in a Plumber REST API

library(plumber)
library(preventr)

#* Health check endpoint
#* @get /health
function() {
  list(
    status = "healthy",
    service = "PREVENT Calculator API",
    package_version = as.character(packageVersion("preventr"))
  )
}

#* Calculate PREVENT cardiovascular risk
#* @param age:int Age in years (30-79)
#* @param sex:str Sex ("female" or "male")
#* @param sbp:dbl Systolic blood pressure in mmHg (90-180)
#* @param bp_tx:bool On blood pressure treatment
#* @param total_c:dbl Total cholesterol in mg/dL (130-320)
#* @param hdl_c:dbl HDL cholesterol in mg/dL (20-100)
#* @param statin:bool Taking a statin
#* @param dm:bool Has diabetes
#* @param smoking:bool Currently smoking
#* @param egfr:dbl Estimated GFR in mL/min/1.73m2 (15-140)
#* @param bmi:dbl Body mass index in kg/m2 (18.5-39.9)
#* @param hba1c:dbl HbA1c in % (4.5-15, optional)
#* @param uacr:dbl Urine albumin-creatinine ratio in mg/g (0.1-25000, optional)
#* @post /calculate
function(age, sex, sbp, bp_tx, total_c, hdl_c, statin, dm, smoking, egfr, bmi,
         hba1c = NULL, uacr = NULL) {
  
  tryCatch({
    # Convert string booleans to logical
    bp_tx_logical <- as.logical(bp_tx)
    statin_logical <- as.logical(statin)
    dm_logical <- as.logical(dm)
    smoking_logical <- as.logical(smoking)
    
    # Convert numeric parameters
    age_num <- as.numeric(age)
    sbp_num <- as.numeric(sbp)
    total_c_num <- as.numeric(total_c)
    hdl_c_num <- as.numeric(hdl_c)
    egfr_num <- as.numeric(egfr)
    bmi_num <- as.numeric(bmi)
    
    # Handle optional parameters
    hba1c_num <- if (!is.null(hba1c) && hba1c != "") as.numeric(hba1c) else NULL
    uacr_num <- if (!is.null(uacr) && uacr != "") as.numeric(uacr) else NULL
    
    # Call the official preventr function
    result <- estimate_risk(
      age = age_num,
      sex = sex,
      sbp = sbp_num,
      bp_tx = bp_tx_logical,
      total_c = total_c_num,
      hdl_c = hdl_c_num,
      statin = statin_logical,
      dm = dm_logical,
      smoking = smoking_logical,
      egfr = egfr_num,
      bmi = bmi_num,
      hba1c = hba1c_num,
      uacr = uacr_num,
      time = "both",
      quiet = TRUE,
      collapse = TRUE
    )
    
    # Convert to list for JSON response
    list(
      success = TRUE,
      results = lapply(1:nrow(result), function(i) {
        row <- result[i, ]
        list(
          total_cvd = row$total_cvd,
          ascvd = row$ascvd,
          heart_failure = row$heart_failure,
          chd = row$chd,
          stroke = row$stroke,
          model = row$model,
          over_years = row$over_years,
          input_problems = if (is.na(row$input_problems)) NULL else row$input_problems
        )
      }),
      source = list(
        package = "preventr",
        version = as.character(packageVersion("preventr")),
        citation = "Khan SS, et al. Circulation. 2023",
        url = "https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator"
      )
    )
    
  }, error = function(e) {
    list(
      success = FALSE,
      error = as.character(e$message)
    )
  })
}

#* @plumber
function(pr) {
  pr %>%
    pr_set_api_spec(function(spec) {
      spec$info$title <- "AHA PREVENT Calculator API"
      spec$info$description <- "Official PREVENT equations via the preventr CRAN package"
      spec$info$version <- "1.0.0"
      spec
    })
}
