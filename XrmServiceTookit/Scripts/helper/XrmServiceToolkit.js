﻿/// <reference path="XrmPageTemplate.js" />
/// <reference path="json2.js" />
/// <reference path="jquery.js" />

/**
* MSCRM 2011 Web Service Toolkit for JavaScript
* @author Jaimie Ji
* @current version : 1.3.1

* Credits:
*   The idea of this library was inspired by Daniel Cai's CrmWebServiceToolkit.
*   The idea of BusinessEntity was inspired by Daniel Cai && Ascentium CrmService JavaScript Library.
*   The REST Endpoint functions were inspired by MSCRM 2011 SDK javascript code and various resources from CRM websites and forums. Some of them were just copies with minor modification.
*   The Soap functions were inspired by Daniel Cai && Jamie Miley && Paul Way && Customer Effective.
*   Additional thanks to all contributors of MSCRM and i have learned a lot from you all.
* Date: February, 2012
*
* Special Thanks:
*   JetBrains ReSharper Open License
* Date: July, 2012
*
* Whats new:
**********************************************************************************************************
*   Version: 1.1
*   Date: April, 2012
*       Dependency: JSON2
*       New Function - XrmServiceToolkit.Soap.Assign
*       New Function - XrmServiceToolkit.Soap.GrantAccess
*       New Function - XrmServiceToolkit.Soap.ModifyAccess
*       New Function - XrmServiceToolkit.Soap.GrantAccess
*       New Function - XrmServiceToolkit.Soap.RetrievePrincipalAccess
**********************************************************************************************************
*   Version: 1.2
*   Date: April, 2012
*       Dependency: JSON2
*       New Fix - Fix soaps functions to create/update/retrieve activities with Party List fields.
**********************************************************************************************************
*   Version: 1.3
*   Date: July, 2012
*       Dependency: JSON2, jQuery (latest or 1.7.2 above)
*       New Feature: cross browser support. jQuery Integration.
*       New Extension: A new category of functions to extend some functions:
*          1. JQueryXrmDependentOptionSet: Create Configurable Dependent Option Set to utilize CRM 2011 web resource.
*          2. JQueryXrmFieldTooltip: Create configurable tooltip for fields on CRM 2011 form
*          3. JQueryXrmCustomFilterView: Create configurable ability to add custom filter view to crm 2011 lookup field on the form
*          4. JQueryXrmFormatNotesControl: Format the notes control to allow insert, allow edit
**********************************************************************************************************
*   Version: 1.3.1
*   Date: November, 2012
*       Dependency: JSON2, jQuery (latest or 1.7.2 above)
*       New Feature - A change of logic to increase peroformance when returning large number of records
*       New Function - XrmServiceToolkit.Soap.QueryAll: Return all available records by query options (>5k+)
*       New Fix - XrmServiceToolkit.Rest.RetrieveMultiple not returning records more than 50
*       New Fix - XrmServiceToolkit.Soap.Business error when refering number fields like (int, double, float)     
*       New Fix - XrmServiceToolkit.Soap not handling error message properly
**********************************************************************************************************
*/

XrmServiceToolkit = function () {
    /// <summary>
    /// XrmServiceToolkit.Common for common funcitons.
    /// XrmServiceToolkit.Rest for all REST endpoints funcitons.
    /// XrmServiceToolkit.Soap for all Soap funtions.
    /// XrmServiceToolkit.Extension for all Extension funtions.
    /// </summary>
};

XrmServiceToolkit.Common = function () {
    var guidsAreEqual = function (guid1, guid2) {
        /// <summary>
        /// Check if two guids are equal
        /// </summary>
        /// <param name="guid1" type="string">
        /// A string represents a guid
        /// </param>
        /// <param name="guid2" type="string">
        /// A string represents a guid
        /// </param>
        /// <returns type="boolean" />
        var isEqual;
        if (guid1 == null || guid2 == null) {
            isEqual = false;
        }
        else {
            isEqual = guid1.replace(/[{}]/g, "").toLowerCase() == guid2.replace(/[{}]/g, "").toLowerCase();
        }

        return isEqual;
    };

    var enableField = function (fieldName) {
        /// <summary>
        /// Enable a field by the name
        /// </summary>
        /// <param name="fieldName" type="string">
        /// The name of the field to be enabled
        /// </param>
        /// <returns type="void" />
        Xrm.Page.getControl(fieldName).setDisabled(false);
    };

    var disableField = function (fieldName) {
        /// <summary>
        /// Disable a field by the name
        /// </summary>
        /// <param name="fieldName" type="string">
        /// The name of the field to be disabled
        /// </param>
        /// <returns type="void" />
        Xrm.Page.getControl(fieldName).setDisabled(true);
    };

    var showField = function (fieldName) {
        /// <summary>
        /// Show a field by the name
        /// </summary>
        /// <param name="fieldName" type="string">
        /// The name of the field to be shown
        /// </param>
        /// <returns type="void" />
        Xrm.Page.getControl(fieldName).setVisible(true);
    };

    var hideField = function (fieldName) {
        /// <summary>
        /// Hide a field by the name
        /// </summary>
        /// <param name="fieldName" type="string">
        /// The name of the field to be hidden
        /// </param>
        /// <returns type="void" />
        Xrm.Page.getControl(fieldName).setVisible(false);
    };

    var updateRequirementLevel = function (fieldName, levelName) {
        /// <summary>
        /// Updates the requirement level of a field
        /// </summary>
        /// <param name="fieldName" type="string">
        /// Name of the field
        /// </param>
        /// <param name="levelName" type="string">
        /// Name of the requirement level. [none, recommended, required] (Case Sensitive)
        /// </param>
        /// <returns type="void" />
        Xrm.Page.getAttribute(fieldName).setRequiredLevel(levelName);
    };

    var showError = function (error) {
        /// <summary>
        /// Alert the error message if occoured
        /// </summary>
        /// <param name="error" type="error">
        /// Object of the javascript error
        /// </param>
        /// <returns type="void" />
        alert(error.message);
    };

    var getObjectTypeCode = function (entityName) {
        /// <summary>
        /// Gets the EntityTypeCode / ObjectTypeCode of a entity
        /// </summary>
        /// <param name="entityName" type="string">
        /// Name of entity to return object type code of
        /// </param>
        /// <returns type="int" />
        try {
            var lookupService = new window.RemoteCommand("LookupService", "RetrieveTypeCode");
            lookupService.SetParameter("entityName", entityName);
            var result = lookupService.Execute();

            if (result.Success && typeof result.ReturnValue == "number") {
                return result.ReturnValue;
            } else {
                return null;
            }
        } catch (e) {
            showError(e.message);
            return null;
        }
    };

    var addNotification = function (message, level) {
        /// <summary>
        /// Add a notification bar message with CRM 2011 style
        /// </summary>
        /// <param name="message" type="string">
        /// Details of the message
        /// </param>
        /// <param name="level" type="int">
        /// The warning level of the message: [1 critial, 2 information, 3 warning]
        /// </param>
        /// <returns type="void" />
        var notificationsArea = document.getElementById('crmNotifications');
        if (notificationsArea == null) {
            alert('div not found'); return;
        }
        if (level == 1) {
            //critical
            notificationsArea.AddNotification('mep1', 1, 'source', message);
        }

        if (level == 2) {
            //Info
            notificationsArea.AddNotification('mep3', 3, 'source', message);
        }
        if (level == 3) {
            //Warning
            notificationsArea.AddNotification('mep2', 2, 'source', message);
        }
        if (message == "") {
            notificationsArea.SetNotifications(null, null);
        }
    };

    var calculateDaysBetween = function (datetime1, datetime2) {
        /// <summary>
        /// Calculate the days between two dates
        /// </summary>
        /// <param name="datetime1" type="DateTime">
        /// The first / early date to be calculated
        /// </param>
        /// <param name="datetime2" type="DateTime">
        /// The second / later date to e calculated
        /// </param>
        /// <returns type="int" />

        // The number of milliseconds in one day
        var oneDay = 1000 * 60 * 60 * 24;

        // Convert both dates to milliseconds
        var date1Ms = datetime1.getTime();
        var date2Ms = datetime2.getTime();

        // Calculate the difference in milliseconds
        var differenceMs = Math.abs(date1Ms - date2Ms); // Convert back to days and return
        return Math.round(differenceMs / oneDay);
    };

    var disableAllControlsInTab = function (tabControlNo) {
        /// <summary>
        /// Disable all controls in a tab by tab number.
        /// </summary>
        /// <param name="tabControlNo" type="int">
        /// The number of the tab
        /// </param>
        /// <returns type="void" />
        var tabControl = Xrm.Page.ui.tabs.get(tabControlNo);
        if (tabControl != null) {
            Xrm.Page.ui.controls.forEach(
             function (control) {
                 if (control.getParent().getParent() == tabControl && control.getControlType() != "subgrid") {
                     control.setDisabled(true);
                 }
             });
        }
    };

    var disableAllControlsInSection = function (sectionLabel) {
        /// <summary>
        /// Disable all controls in a section by section label.
        /// </summary>
        /// <param name="sectionLabel" type="string">
        /// The label of the section
        /// </param>
        /// <returns type="void" />
        var tabs = Xrm.Page.ui.tabs;
        for (var i = 0; i < tabs.getLength(); i++) {
            var tab = tabs.get(i);
            var sections = tab.sections;
            for (var j = 0; j < sections.getLength(); j++) {
                var section = sections.get(j);
                if (section.getLabel().toLowerCase() == sectionLabel.toLowerCase()) {
                    Xrm.Page.ui.controls.forEach(
                        function (control) {
                            if (control.getParent().getLabel() == sectionLabel && control.getControlType() != "subgrid") {
                                control.setDisabled(true);
                            }
                        });
                    break;
                }
            }
        }
    };

    // Toolkit's public static members
    return {
        EnableField: enableField,
        DisableField: disableField,
        ShowField: showField,
        HideField: hideField,
        UpdateRequiredLevel: updateRequirementLevel,
        GetObjectTypeCode: getObjectTypeCode,
        CalculateDaysBetween: calculateDaysBetween,
        AddNotification: addNotification,
        ShowError: showError,
        GuidsAreEqual: guidsAreEqual,
        DisableAllControlsInTab: disableAllControlsInTab,
        DisableAllControlsInSection: disableAllControlsInSection
    };
} ();

XrmServiceToolkit.Rest = function () {
    // Private members
    var htmlEncode = function (s) {
        if (s == null || s == "") return s;
        for (var count = 0, buffer = "", hEncode = "", cnt = 0; cnt < s.length; cnt++) {
            var c = s.charCodeAt(cnt);
            if (c > 96 && c < 123 || c > 64 && c < 91 || c == 32 || c > 47 && c < 58 || c == 46 || c == 44 || c == 45 || c == 95)
                buffer += String.fromCharCode(c);
            else buffer += "&#" + c + ";";
            if (++count == 500) {
                hEncode += buffer; buffer = ""; count = 0;
            }
        }
        if (buffer.length) hEncode += buffer;
        return hEncode;
    };

    var innerSurrogateAmpersandWorkaround = function (s) {
        var buffer = '';
        var c0;
        for (var cnt = 0; cnt < s.length; cnt++) {
            c0 = s.charCodeAt(cnt);
            if (c0 >= 55296 && c0 <= 57343)
                if (cnt + 1 < s.length) {
                    var c1 = s.charCodeAt(cnt + 1);
                    if (c1 >= 56320 && c1 <= 57343) {
                        buffer += "CRMEntityReferenceOpen" + ((c0 - 55296) * 1024 + (c1 & 1023) + 65536).toString(16) + "CRMEntityReferenceClose"; cnt++;
                    }
                    else
                        buffer += String.fromCharCode(c0);
                }
                else buffer += String.fromCharCode(c0);
            else buffer += String.fromCharCode(c0);
        }
        s = buffer;
        buffer = "";
        for (cnt = 0; cnt < s.length; cnt++) {
            c0 = s.charCodeAt(cnt);
            if (c0 >= 55296 && c0 <= 57343)
                buffer += String.fromCharCode(65533);
            else buffer += String.fromCharCode(c0);
        }
        s = buffer;
        s = htmlEncode(s);
        s = s.replace(/CRMEntityReferenceOpen/g, "&#x");
        s = s.replace(/CRMEntityReferenceClose/g, ";");
        return s;
    };

    // ReSharper disable UnusedLocals
    var crmXmlEncode = function (s) {
        // ReSharper restore UnusedLocals
        // ReSharper disable UsageOfPossiblyUnassignedValue
        if ("undefined" == typeof s || "unknown" == typeof s || null == s) return s;
        // ReSharper restore UsageOfPossiblyUnassignedValue
        else if (typeof s != "string") s = s.toString();
        return innerSurrogateAmpersandWorkaround(s);
    };

    // ReSharper disable UnusedLocals
    var crmXmlDecode = function (s) {
        // ReSharper restore UnusedLocals
        if (typeof s != "string") s = s.toString();
        return s;
    };

    var context = function () {
        ///<summary>
        /// Private function to the context object.
        ///</summary>
        ///<returns>Context</returns>
        var oContext;
        if (typeof window.GetGlobalContext != "undefined") {
            oContext = window.GetGlobalContext();
        }
        else {
            if (typeof Xrm != "undefined") {
                oContext = Xrm.Page.context;
            }
            else if (typeof window.parent.Xrm != "undefined") {
                oContext = window.parent.Xrm.Page.context;
            }
            else {
                throw new Error("Context is not available.");
            }
        }
        return oContext;
    };

    var getServerUrl = function () {
        ///<summary>
        /// Private function to return the server URL from the context
        ///</summary>
        ///<returns>String</returns>
        var serverUrl = context().getServerUrl();
        if (serverUrl.match(/\/$/)) {
            serverUrl = serverUrl.substring(0, serverUrl.length - 1);
        }
        return serverUrl;
    };

    var oDataPath = function () {
        ///<summary>
        /// Private function to return the path to the REST endpoint.
        ///</summary>
        ///<returns>String</returns>
        return getServerUrl() + "/XRMServices/2011/OrganizationData.svc/";
    };

    var errorHandler = function (req) {
        ///<summary>
        /// Private function return an Error object to the errorCallback
        ///</summary>
        ///<param name="req" type="XMLHttpRequest">
        /// The XMLHttpRequest response that returned an error.
        ///</param>
        ///<returns>Error</returns>
        return new Error("Error : " +
        req.status + ": " +
        req.statusText + ": " +
        JSON.parse(req.responseText).error.message.value);
    };

    var dateReviver = function (key, value) {
        ///<summary>
        /// Private function to convert matching string values to Date objects.
        ///</summary>
        ///<param name="key" type="String">
        /// The key used to identify the object property
        ///</param>
        ///<param name="value" type="String">
        /// The string value representing a date
        ///</param>
        var a;
        if (typeof value === 'string') {
            a = /Date\(([-+]?\d+)\)/.exec(value);
            if (a) {
                return new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
            }
        }
        return value;
    };

    var parameterCheck = function (parameter, message) {
        ///<summary>
        /// Private function used to check whether required parameters are null or undefined
        ///</summary>
        ///<param name="parameter" type="Object">
        /// The parameter to check;
        ///</param>
        ///<param name="message" type="String">
        /// The error message text to include when the error is thrown.
        ///</param>
        if ((typeof parameter === "undefined") || parameter === null) {
            throw new Error(message);
        }
    };

    var stringParameterCheck = function (parameter, message) {
        ///<summary>
        /// Private function used to check whether required parameters are null or undefined
        ///</summary>
        ///<param name="parameter" type="String">
        /// The string parameter to check;
        ///</param>
        ///<param name="message" type="String">
        /// The error message text to include when the error is thrown.
        ///</param>
        if (typeof parameter != "string") {
            throw new Error(message);
        }
    };

    var callbackParameterCheck = function (callbackParameter, message) {
        ///<summary>
        /// Private function used to check whether required callback parameters are functions
        ///</summary>
        ///<param name="callbackParameter" type="Function">
        /// The callback parameter to check;
        ///</param>
        ///<param name="message" type="String">
        /// The error message text to include when the error is thrown.
        ///</param>
        if (typeof callbackParameter != "function") {
            throw new Error(message);
        }
    };

    var booleanParameterCheck = function (parameter, message) {
        ///<summary>
        /// Private function used to check whether required parameters are null or undefined
        ///</summary>
        ///<param name="parameter" type="String">
        /// The string parameter to check;
        ///</param>
        ///<param name="message" type="String">
        /// The error message text to include when the error is thrown.
        ///</param>
        if (typeof parameter != "boolean") {
            throw new Error(message);
        }
    };

    var getXhr = function () {
        ///<summary>
        /// Get an instance of XMLHttpRequest for all browers
        ///</summary>
        if (XMLHttpRequest) {
            // Chrome, Firefox, IE7+, Opera, Safari
            // ReSharper disable InconsistentNaming
            return new XMLHttpRequest();
            // ReSharper restore InconsistentNaming
        }
        // IE6
        try {
            // The latest stable version. It has the best security, performance,
            // reliability, and W3C conformance. Ships with Vista, and available
            // with other OS's via downloads and updates.
            return new ActiveXObject('MSXML2.XMLHTTP.6.0');
        } catch (e) {
            try {
                // The fallback.
                return new ActiveXObject('MSXML2.XMLHTTP.3.0');
            } catch (e) {
                alert('This browser is not AJAX enabled.');
                return null;
            }
        }
    };

    var createRecord = function (object, type, successCallback, errorCallback, async) {
        ///<summary>
        /// Sends synchronous/asynchronous request to create a new record.
        ///</summary>
        ///<param name="object" type="Object">
        /// A JavaScript object with properties corresponding to the Schema name of
        /// entity attributes that are valid for create operations.
        ///</param>
        parameterCheck(object, "XrmServiceToolkit.REST.createRecord requires the object parameter.");
        ///<param name="type" type="string">
        /// A String representing the name of the entity
        ///</param>
        stringParameterCheck(type, "XrmServiceToolkit.REST.createRecord requires the type parameter is a string.");
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response.
        /// This function can accept the returned record as a parameter.
        /// </param>
        callbackParameterCheck(successCallback, "XrmServiceToolkit.REST.createRecord requires the successCallback is a function.");
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response.
        /// This function must accept an Error object as a parameter.
        /// </param>
        callbackParameterCheck(errorCallback, "XrmServiceToolkit.REST.createRecord requires the errorCallback is a function.");
        ///<param name="async" type="Boolean">
        /// A Boolean representing if the method should run asynchronously or synchronously
        /// true means asynchronously. false means synchronously
        /// </param>
        booleanParameterCheck(async, "XrmServiceToolkit.REST.createRecord requires the async is a boolean.");

        var req = getXhr();
        req.open("POST", oDataPath() + type, async);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                if (this.status == 201) {
                    successCallback(JSON.parse(this.responseText, dateReviver).d);
                }
                else {
                    errorCallback(errorHandler(this));
                }
            }
        };
        req.send(JSON.stringify(object));
    };

    var retrieveRecord = function (id, type, select, expand, successCallback, errorCallback, async) {
        ///<summary>
        /// Sends synchronous/asynchronous request to retrieve a record.
        ///</summary>
        ///<param name="id" type="String">
        /// A String representing the GUID value for the record to retrieve.
        ///</param>
        stringParameterCheck(id, "XrmServiceToolkit.REST.retrieveRecord requires the id parameter is a string.");
        ///<param name="type" type="string">
        /// A String representing the name of the entity
        ///</param>
        stringParameterCheck(type, "XrmServiceToolkit.REST.retrieveRecord requires the type parameter is a string.");
        ///<param name="select" type="String">
        /// A String representing the $select OData System Query Option to control which
        /// attributes will be returned. This is a comma separated list of Attribute names that are valid for retrieve.
        /// If null all properties for the record will be returned
        ///</param>
        if (select != null)
            stringParameterCheck(select, "XrmServiceToolkit.REST.retrieveRecord requires the select parameter is a string.");
        ///<param name="expand" type="String">
        /// A String representing the $expand OData System Query Option value to control which
        /// related records are also returned. This is a comma separated list of of up to 6 entity relationship names
        /// If null no expanded related records will be returned.
        ///</param>
        if (expand != null)
            stringParameterCheck(expand, "XrmServiceToolkit.REST.retrieveRecord requires the expand parameter is a string.");
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response.
        /// This function must accept the returned record as a parameter.
        /// </param>
        callbackParameterCheck(successCallback, "XrmServiceToolkit.REST.retrieveRecord requires the successCallback parameter is a function.");
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response.
        /// This function must accept an Error object as a parameter.
        /// </param>
        callbackParameterCheck(errorCallback, "XrmServiceToolkit.REST.retrieveRecord requires the errorCallback parameter is a function.");
        ///<param name="async" type="Boolean">
        /// A Boolean representing if the method should run asynchronously or synchronously
        /// true means asynchronously. false means synchronously
        /// </param>
        booleanParameterCheck(async, "XrmServiceToolkit.REST.retrieveRecord requires the async parameter is a boolean.");

        var systemQueryOptions = "";

        if (select != null || expand != null) {
            systemQueryOptions = "?";
            if (select != null) {
                var selectString = "$select=" + select;
                if (expand != null) {
                    selectString = selectString + "," + expand;
                }
                systemQueryOptions = systemQueryOptions + selectString;
            }
            if (expand != null) {
                systemQueryOptions = systemQueryOptions + "&$expand=" + expand;
            }
        }

        var req = getXhr();
        req.open("GET", oDataPath() + type + "(guid'" + id + "')" + systemQueryOptions, async);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                if (this.status == 200) {
                    successCallback(JSON.parse(this.responseText, dateReviver).d);
                }
                else {
                    errorCallback(errorHandler(this));
                }
            }
        };
        req.send();
    };

    var updateRecord = function (id, object, type, successCallback, errorCallback, async) {
        ///<summary>
        /// Sends synchronous/asynchronous request to update a record.
        ///</summary>
        ///<param name="id" type="String">
        /// A String representing the GUID value for the record to update.
        ///</param>
        stringParameterCheck(id, "XrmServiceToolkit.REST.updateRecord requires the id parameter.");
        ///<param name="object" type="Object">
        /// A JavaScript object with properties corresponding to the Schema name of
        /// entity attributes that are valid for create operations.
        ///</param>
        parameterCheck(object, "XrmServiceToolkit.REST.updateRecord requires the object parameter.");
        ///<param name="type" type="string">
        /// A String representing the name of the entity
        ///</param>
        stringParameterCheck(type, "XrmServiceToolkit.REST.updateRecord requires the type parameter.");
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response.
        /// Nothing will be returned to this function.
        /// </param>
        callbackParameterCheck(successCallback, "XrmServiceToolkit.REST.updateRecord requires the successCallback is a function.");
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response.
        /// This function must accept an Error object as a parameter.
        /// </param>
        callbackParameterCheck(errorCallback, "XrmServiceToolkit.REST.updateRecord requires the errorCallback is a function.");
        ///<param name="async" type="Boolean">
        /// A Boolean representing if the method should run asynchronously or synchronously
        /// true means asynchronously. false means synchronously
        /// </param>
        booleanParameterCheck(async, "XrmServiceToolkit.REST.updateRecord requires the async parameter is a boolean.");

        var req = getXhr();

        req.open("POST", oDataPath() + type + "(guid'" + id + "')", async);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("X-HTTP-Method", "MERGE");

        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                if (this.status == 204 || this.status == 1223) {
                    successCallback();
                }
                else {
                    errorCallback(errorHandler(this));
                }
            }
        };
        req.send(JSON.stringify(object));
    };

    var deleteRecord = function (id, type, successCallback, errorCallback, async) {
        ///<summary>
        /// Sends synchronous/asynchronous request to delete a record.
        ///</summary>
        ///<param name="id" type="String">
        /// A String representing the GUID value for the record to delete.
        ///</param>
        stringParameterCheck(id, "XrmServiceToolkit.REST.deleteRecord requires the id parameter.");
        ///<param name="type" type="string">
        /// A String representing the name of the entity
        ///</param>
        stringParameterCheck(type, "XrmServiceToolkit.REST.deleteRecord requires the type parameter.");
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response.
        /// Nothing will be returned to this function.
        /// </param>
        callbackParameterCheck(successCallback, "XrmServiceToolkit.REST.deleteRecord requires the successCallback is a function.");
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response.
        /// This function must accept an Error object as a parameter.
        /// </param>
        callbackParameterCheck(errorCallback, "XrmServiceToolkit.REST.deleteRecord requires the errorCallback is a function.");
        ///<param name="async" type="Boolean">
        /// A Boolean representing if the method should run asynchronously or synchronously
        /// true means asynchronously. false means synchronously
        /// </param>
        booleanParameterCheck(async, "XrmServiceToolkit.REST.deleteRecord requires the async parameter is a boolean.");

        var req = getXhr();
        req.open("POST", oDataPath() + type + "(guid'" + id + "')", async);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("X-HTTP-Method", "DELETE");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                if (this.status == 204 || this.status == 1223) {
                    successCallback();
                }
                else {
                    errorCallback(errorHandler(this));
                }
            }
        };
        req.send();
    };

    var retrieveMultipleRecords = function (type, options, successCallback, errorCallback, onComplete, async) {
        ///<summary>
        /// Sends synchronous/asynchronous request to retrieve records.
        ///</summary>
        ///<param name="type" type="String">
        /// The Schema Name of the Entity type record to retrieve.
        /// For an Account record, use "Account"
        ///</param>
        stringParameterCheck(type, "XrmServiceToolkit.REST.retrieveMultipleRecords requires the type parameter is a string.");
        ///<param name="options" type="String">
        /// A String representing the OData System Query Options to control the data returned
        ///</param>
        if (options != null)
            stringParameterCheck(options, "XrmServiceToolkit.REST.retrieveMultipleRecords requires the options parameter is a string.");
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called for each page of records returned.
        /// Each page is 50 records. If you expect that more than one page of records will be returned,
        /// this function should loop through the results and push the records into an array outside of the function.
        /// Use the OnComplete event handler to know when all the records have been processed.
        /// </param>
        callbackParameterCheck(successCallback, "XrmServiceToolkit.REST.retrieveMultipleRecords requires the successCallback parameter is a function.");
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response.
        /// This function must accept an Error object as a parameter.
        /// </param>
        callbackParameterCheck(errorCallback, "XrmServiceToolkit.REST.retrieveMultipleRecords requires the errorCallback parameter is a function.");
        ///<param name="OnComplete" type="Function">
        /// The function that will be called when all the requested records have been returned.
        /// No parameters are passed to this function.
        /// </param>
        callbackParameterCheck(onComplete, "XrmServiceToolkit.REST.retrieveMultipleRecords requires the OnComplete parameter is a function.");
        ///<param name="async" type="Boolean">
        /// A Boolean representing if the method should run asynchronously or synchronously
        /// true means asynchronously. false means synchronously
        /// </param>
        booleanParameterCheck(async, "XrmServiceToolkit.REST.retrieveMultipleRecords requires the async parameter is a boolean.");

        var optionsString = '';
        if (options != null) {
            if (options.charAt(0) != "?") {
                optionsString = "?" + options;
            }
            else {
                optionsString = options;
            }
        }

        var req = getXhr();
        req.open("GET", oDataPath() + type + optionsString, async);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                if (this.status == 200) {
                    var returned = JSON.parse(this.responseText, dateReviver).d;
                    successCallback(returned.results);
                    if (returned.__next != null) {
                        var queryOptions = returned.__next.substring((oDataPath() + type).length);
                        retrieveMultipleRecords(type, queryOptions, successCallback, errorCallback, onComplete, async);
                    }
                    else {
                        onComplete();
                    }
                }
                else {
                    errorCallback(errorHandler(this));
                }
            }
        };
        req.send();
    };

    var performRequest = function (settings) {
        parameterCheck(settings, "The value passed to the performRequest function settings parameter is null or undefined.");
        var request = getXhr();
        request.open(settings.type, settings.url, settings.async);
        request.setRequestHeader("Accept", "application/json");
        if (settings.action != null) {
            request.setRequestHeader("X-HTTP-Method", settings.action);
        }
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.onreadystatechange = function () {
            if (this.readyState == 4 /*Complete*/) {
                // Status 201 is for create, status 204/1223 for link and delete.
                // There appears to be an issue where IE maps the 204 status to 1223
                // when no content is returned.
                if (this.status == 204 || this.status == 1223 || this.status == 201) {
                    settings.success(this);
                }
                else {
                    // Failure
                    if (settings.error) {
                        settings.error(errorHandler(this));
                    }
                    else {
                        errorHandler(this);
                    }
                }
            }
        };

        if (typeof settings.data === "undefined") {
            request.send();
        }
        else {
            request.send(settings.data);
        }
    };

    var associateRecord = function (entityid1, odataSetName1, entityid2, odataSetName2, relationship, successCallback, errorCallback, async) {
        ///<summary>
        /// Sends synchronous/asynchronous request to associate a record.
        ///</summary>
        ///<param name="entityid1" type="string">
        /// A String representing the GUID value for the record to associate.
        ///</param>
        parameterCheck(entityid1, "XrmServiceToolkit.REST.associateRecord requires the entityid1 parameter.");
        ///<param name="odataSetName1" type="string">
        /// A String representing the odataset name for entityid1
        ///</param>
        parameterCheck(odataSetName1, "XrmServiceToolkit.REST.associateRecord requires the odataSetName1 parameter.");
        ///<param name="entityid2" type="string">
        /// A String representing the GUID value for the record to be associated.
        ///</param>
        parameterCheck(entityid2, "XrmServiceToolkit.REST.associateRecord requires the entityid2 parameter.");
        ///<param name="odataSetName2" type="string">
        /// A String representing the odataset name for entityid2
        ///</param>
        parameterCheck(odataSetName2, "XrmServiceToolkit.REST.associateRecord requires the odataSetName2 parameter.");
        ///<param name="relationship" type="string">
        /// A String representing the name of the relationship for association
        ///</param>
        parameterCheck(relationship, "XrmServiceToolkit.REST.associateRecord requires the relationship parameter.");
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response.
        /// Nothing will be returned to this function.
        /// </param>
        callbackParameterCheck(successCallback, "XrmServiceToolkit.REST.associateRecord requires the successCallback is a function.");
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response.
        /// This function must accept an Error object as a parameter.
        /// </param>
        callbackParameterCheck(errorCallback, "XrmServiceToolkit.REST.associateRecord requires the errorCallback is a function.");
        ///<param name="async" type="Boolean">
        /// A Boolean representing if the method should run asynchronously or synchronously
        /// true means asynchronously. false means synchronously
        /// </param>
        booleanParameterCheck(async, "XrmServiceToolkit.REST.associateRecord requires the async parameter is a boolean");

        var entity2 = {};
        entity2.uri = oDataPath() + "/" + odataSetName2 + "(guid'" + entityid2 + "')";
        var jsonEntity = window.JSON.stringify(entity2);

        performRequest({
            type: "POST",
            url: oDataPath() + "/" + odataSetName1 + "(guid'" + entityid1 + "')/$links/" + relationship,
            data: jsonEntity,
            success: successCallback,
            error: errorCallback,
            async: async
        });
    };

    var disassociateRecord = function (entityid1, odataSetName, entityid2, relationship, successCallback, errorCallback, async) {
        ///<summary>
        /// Sends synchronous/asynchronous request to disassociate a record.
        ///</summary>
        ///<param name="entityid1" type="string">
        /// A String representing the GUID value for the record to disassociate.
        ///</param>
        parameterCheck(entityid1, "XrmServiceToolkit.REST.disassociateRecord requires the entityid1 parameter.");
        ///<param name="odataSetName" type="string">
        /// A String representing the odataset name for entityid1
        ///</param>
        parameterCheck(odataSetName, "XrmServiceToolkit.REST.disassociateRecord requires the odataSetName parameter.");
        ///<param name="entityid2" type="string">
        /// A String representing the GUID value for the record to be disassociated.
        ///</param>
        parameterCheck(entityid2, "XrmServiceToolkit.REST.disassociateRecord requires the entityid2 parameter.");
        ///<param name="relationship" type="string">
        /// A String representing the name of the relationship for disassociation
        ///</param>
        parameterCheck(relationship, "XrmServiceToolkit.REST.disassociateRecord requires the relationship parameter.");
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response.
        /// Nothing will be returned to this function.
        /// </param>
        callbackParameterCheck(successCallback, "XrmServiceToolkit.REST.disassociateRecord requires the successCallback is a function.");
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response.
        /// This function must accept an Error object as a parameter.
        /// </param>
        callbackParameterCheck(errorCallback, "XrmServiceToolkit.REST.disassociateRecord requires the errorCallback is a function.");
        ///<param name="async" type="Boolean">
        /// A Boolean representing if the method should run asynchronously or synchronously
        /// true means asynchronously. false means synchronously
        /// </param>
        booleanParameterCheck(async, "XrmServiceToolkit.REST.disassociateRecord requires the async parameter is a boolean.");

        var url = oDataPath() + "/" + odataSetName + "(guid'" + entityid1 + "')/$links/" + relationship + "(guid'" + entityid2 + "')";
        performRequest({
            url: url,
            type: "POST",
            action: "DELETE",
            error: errorCallback,
            success: successCallback,
            async: async
        });
    };

    // Toolkit's public static members
    return {
        Create: createRecord,
        Retrieve: retrieveRecord,
        Update: updateRecord,
        Delete: deleteRecord,
        RetrieveMultiple: retrieveMultipleRecords,
        Associate: associateRecord,
        Disassociate: disassociateRecord
    };
} ();

XrmServiceToolkit.Soap = function () {

    var htmlEncode = function (s) {
        if (s == null || s == "") return s;
        for (var count = 0, buffer = "", hEncode = "", cnt = 0; cnt < s.length; cnt++) {
            var c = s.charCodeAt(cnt);
            if (c > 96 && c < 123 || c > 64 && c < 91 || c == 32 || c > 47 && c < 58 || c == 46 || c == 44 || c == 45 || c == 95)
                buffer += String.fromCharCode(c);
            else buffer += "&#" + c + ";";
            if (++count == 500) {
                hEncode += buffer; buffer = ""; count = 0;
            }
        }
        if (buffer.length) hEncode += buffer;
        return hEncode;
    };

    var innerSurrogateAmpersandWorkaround = function (s) {
        var buffer = '';
        var c0;
        for (var cnt = 0; cnt < s.length; cnt++) {
            c0 = s.charCodeAt(cnt);
            if (c0 >= 55296 && c0 <= 57343)
                if (cnt + 1 < s.length) {
                    var c1 = s.charCodeAt(cnt + 1);
                    if (c1 >= 56320 && c1 <= 57343) {
                        buffer += "CRMEntityReferenceOpen" + ((c0 - 55296) * 1024 + (c1 & 1023) + 65536).toString(16) + "CRMEntityReferenceClose"; cnt++;
                    }
                    else
                        buffer += String.fromCharCode(c0);
                }
                else buffer += String.fromCharCode(c0);
            else buffer += String.fromCharCode(c0);
        }
        s = buffer;
        buffer = "";
        for (cnt = 0; cnt < s.length; cnt++) {
            c0 = s.charCodeAt(cnt);
            if (c0 >= 55296 && c0 <= 57343)
                buffer += String.fromCharCode(65533);
            else buffer += String.fromCharCode(c0);
        }
        s = buffer;
        s = htmlEncode(s);
        s = s.replace(/CRMEntityReferenceOpen/g, "&#x");
        s = s.replace(/CRMEntityReferenceClose/g, ";");
        return s;
    };

    var crmXmlEncode = function (s) {
        // ReSharper disable UsageOfPossiblyUnassignedValue
        if ("undefined" == typeof s || "unknown" == typeof s || null == s) return s;
        // ReSharper restore UsageOfPossiblyUnassignedValue
        else if (typeof s != "string") s = s.toString();
        return innerSurrogateAmpersandWorkaround(s);
    };

    var crmXmlDecode = function (s) {
        if (typeof s != "string") s = s.toString();
        return s;
    };

    var padNumber = function (s, len) {
        len = len || 2;

        s = '' + s;
        while (s.length < len) {
            s = "0" + s;
        }
        return s;
    };

    var encodeDate = function (dateTime) {
        return dateTime.getFullYear() + "-" +
               padNumber(dateTime.getMonth() + 1) + "-" +
               padNumber(dateTime.getDate()) + "T" +
               padNumber(dateTime.getHours()) + ":" +
               padNumber(dateTime.getMinutes()) + ":" +
               padNumber(dateTime.getSeconds());
    };

    var encodeValue = function (value) {
        return (typeof value === "object" && value.getTime)
               ? encodeDate(value)
               : ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlEncode(value) : crmXmlEncode(value));
    };

    var context = function () {
        ///<summary>
        /// Private function to the context object.
        ///</summary>
        ///<returns>Context</returns>
        var oContext;
        if (typeof window.GetGlobalContext != "undefined") {
            oContext = window.GetGlobalContext();
        }
        else {
            if (typeof Xrm != "undefined") {
                oContext = Xrm.Page.context;
            }
            else if (typeof window.parent.Xrm != "undefined") {
                oContext = window.parent.Xrm.Page.context;
            }
            else {
                throw new Error("Context is not available.");
            }
        }
        return oContext;
    };

    var getServerUrl = function () {
        ///<summary>
        /// Private function to return the server URL from the context
        ///</summary>
        ///<returns>String</returns>
        var serverUrl = context().getServerUrl();
        if (serverUrl.match(/\/$/)) {
            serverUrl = serverUrl.substring(0, serverUrl.length - 1);
        }
        return serverUrl;
    };

    var orgServicePath = function () {
        ///<summary>
        /// Private function to return the path to the organization service.
        ///</summary>
        ///<returns>String</returns>
        return getServerUrl() + "/XRMServices/2011/Organization.svc/web";
    };

    // ReSharper disable UnusedLocals
    var dateReviver = function (key, value) {
        // ReSharper restore UnusedLocals
        ///<summary>
        /// Private function to convert matching string values to Date objects.
        ///</summary>
        ///<param name="key" type="String">
        /// The key used to identify the object property
        ///</param>
        ///<param name="value" type="String">
        /// The string value representing a date
        ///</param>
        var a;
        if (typeof value === 'string') {
            a = /Date\(([-+]?\d+)\)/.exec(value);
            if (a) {
                return new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
            }
        }
        return value;
    };

    var xrmValue = function (sType, sValue) {
        this.type = sType;
        this.value = sValue;
    };

    var xrmEntityReference = function (gId, sLogicalName, sName) {
        this.id = gId;
        this.logicalName = sLogicalName;
        this.name = sName;
        this.type = 'EntityReference';
    };

    var xrmEntityCollection = function (items) {
        this.value = items;
        this.type = 'EntityCollection';
    };

    var xrmOptionSetValue = function (iValue, sFormattedValue) {
        this.value = iValue;
        this.formattedValue = sFormattedValue;
        this.type = 'OptionSetValue';
    };

    var businessEntity = function (logicalName, id) {
        ///<summary>
        /// A object represents a business entity for CRM 2011.
        ///</summary>
        ///<param name="logicalName" type="String">
        /// A String represents the name of the entity.
        /// For example, "contact" means the business entity will be a contact entity
        /// </param>
        ///<param name="id" type="String">
        /// A String represents the id of the entity. If not passed, it will be autopopulated as a empty guid string
        /// </param>
        this.id = (!id) ? "00000000-0000-0000-0000-000000000000" : id;
        this.logicalName = logicalName;
        this.attributes = new Object();
    };

    var getXhr = function () {
        ///<summary>
        /// Get an instance of XMLHttpRequest for all browers
        ///</summary>
        if (XMLHttpRequest) {
            // Chrome, Firefox, IE7+, Opera, Safari
            // ReSharper disable InconsistentNaming
            return new XMLHttpRequest();
            // ReSharper restore InconsistentNaming
        }
        // IE6
        try {
            // The latest stable version. It has the best security, performance,
            // reliability, and W3C conformance. Ships with Vista, and available
            // with other OS's via downloads and updates.
            return new ActiveXObject('MSXML2.XMLHTTP.6.0');
        } catch (e) {
            try {
                // The fallback.
                return new ActiveXObject('MSXML2.XMLHTTP.3.0');
            } catch (e) {
                alert('This browser is not AJAX enabled.');
                return null;
            }
        }
    };

    businessEntity.prototype = {
        /**
        * Serialize a CRM Business Entity object to XML string in order to be passed to CRM Web Services.
        * @return {String} The serialized XML string of CRM entity.
        */
        serialize: function () {
            var xml = ['<entity xmlns:a="http://schemas.microsoft.com/xrm/2011/Contracts">'];
            xml.push('<a:Attributes xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic">');

            for (var attributeName in this.attributes) {
                var attribute = this.attributes[attributeName];

                xml.push('<a:KeyValuePairOfstringanyType>');
                xml.push('<b:key>', attributeName, '</b:key>');

                if (attribute === null || attribute.value === null) {
                    xml.push('<b:value i:nil="true" />');
                }
                else {
                    var sType = (!attribute.type)
                            ? typeof attribute
                            : ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlEncode(attribute.type) : crmXmlEncode(attribute.type));
                    var value;
                    var encodedValue;
                    var id;
                    var encodedId;
                    var logicalName;
                    var encodedLogicalName;
                    switch (sType) {
                        case "OptionSetValue":
                            value = (attribute.hasOwnProperty("value")) ? attribute["value"] : attribute;
                            encodedValue = encodeValue(value);
                            xml.push('<b:value i:type="a:OptionSetValue">');
                            xml.push('<a:Value>', encodedValue, '</a:Value>', '</b:value>');
                            break;

                        case "EntityCollection":
                            xml.push('<b:value i:type="a:EntityCollection">');
                            xml.push('<a:Entities>');
                            value = (attribute.hasOwnProperty("value")) ? attribute["value"] : attribute;
                            var collections = isArray(value) ? value : [value];

                            for (var i = 0; i < collections.length; i++) {
                                var item = collections[i];
                                id = (item.hasOwnProperty("id")) ? item["id"] : item;
                                encodedId = encodeValue(id);
                                logicalName = (item.hasOwnProperty("logicalName")) ? item["logicalName"] : item;
                                encodedLogicalName = encodeValue(logicalName);
                                xml.push('<a:Entity>');
                                xml.push('<a:Attributes>');
                                xml.push('<a:KeyValuePairOfstringanyType>');
                                xml.push('<b:key>partyid</b:key>');
                                xml.push('<b:value i:type="a:EntityReference">');
                                xml.push('<a:Id>', encodedId, '</a:Id>');
                                xml.push('<a:LogicalName>', encodedLogicalName, '</a:LogicalName>');
                                xml.push('<a:Name i:nil="true" />');
                                xml.push('</b:value>');
                                xml.push('</a:KeyValuePairOfstringanyType>');
                                xml.push('</a:Attributes>');
                                xml.push('<a:EntityState i:nil="true" />');
                                xml.push('<a:FormattedValues />');
                                xml.push('<a:Id>00000000-0000-0000-0000-000000000000</a:Id>');
                                xml.push('<a:LogicalName>activityparty</a:LogicalName>');
                                xml.push('<a:RelatedEntities />');
                                xml.push('</a:Entity>');
                            }
                            xml.push('</a:Entities>');
                            xml.push('<a:EntityName i:nil="true" />');
                            xml.push('<a:MinActiveRowVersion i:nil="true" />');
                            xml.push('<a:MoreRecords>false</a:MoreRecords>');
                            xml.push('<a:PagingCookie i:nil="true" />');
                            xml.push('<a:TotalRecordCount>0</a:TotalRecordCount>');
                            xml.push('<a:TotalRecordCountLimitExceeded>false</a:TotalRecordCountLimitExceeded>');
                            xml.push('</b:value>');
                            break;

                        case "EntityReference":
                            id = (attribute.hasOwnProperty("id")) ? attribute["id"] : attribute;
                            encodedId = encodeValue(id);
                            logicalName = (attribute.hasOwnProperty("logicalName")) ? attribute["logicalName"] : attribute;
                            encodedLogicalName = encodeValue(logicalName);
                            xml.push('<b:value i:type="a:EntityReference">');
                            xml.push('<a:Id>', encodedId, '</a:Id>');
                            xml.push('<a:LogicalName>', encodedLogicalName, '</a:LogicalName>');
                            xml.push('<a:Name i:nil="true" />', '</b:value>');
                            break;

                        case "Money":
                            value = (attribute.hasOwnProperty("value")) ? attribute["value"] : attribute;
                            encodedValue = encodeValue(value);
                            xml.push('<b:value i:type="a:Money">');
                            xml.push('<a:Value>', encodedValue, '</a:Value>', '</b:value>');
                            break;

                        case "guid":
                            value = (attribute.hasOwnProperty("value")) ? attribute["value"] : attribute;
                            encodedValue = encodeValue(value);
                            xml.push('<b:value i:type="c:guid" xmlns:c="http://schemas.microsoft.com/2003/10/Serialization/">');
                            xml.push(encodedValue, '</b:value>');
                            break;

                        case "number":
                            value = (attribute.hasOwnProperty("value")) ? attribute["value"] : attribute;
                            encodedValue = encodeValue(value);
                            var oType = (parseInt(encodedValue) == encodedValue) ? "c:int" : "c:decimal";
                            xml.push('<b:value i:type="', oType, '" xmlns:c="http://www.w3.org/2001/XMLSchema">');
                            xml.push(encodedValue, '</b:value>');
                            break;

                        default:
                            value = (attribute.hasOwnProperty("value")) ? attribute["value"] : attribute;
                            encodedValue = encodeValue(value);
                            sType = (typeof value === "object" && value.getTime) ? "dateTime" : sType;
                            xml.push('<b:value i:type="c:', sType, '" xmlns:c="http://www.w3.org/2001/XMLSchema">', encodedValue, '</b:value>');
                            break;
                    }
                }
                xml.push('</a:KeyValuePairOfstringanyType>');
            }

            xml.push('</a:Attributes><a:EntityState i:nil="true" />');
            xml.push('<a:FormattedValues xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic" />');
            xml.push('<a:Id>', encodeValue(this.id), '</a:Id>');
            xml.push('<a:LogicalName>', this.logicalName, '</a:LogicalName>');
            xml.push('<a:RelatedEntities xmlns:b="http://schemas.datacontract.org/2004/07/System.Collections.Generic" />');
            xml.push('</entity>');
            return xml.join("");
        },

        /**
        * Deserialize an XML node into a CRM Business Entity object. The XML node comes from CRM Web Service's response.
        * @param {object} resultNode The XML node returned from CRM Web Service's Fetch, Retrieve, RetrieveMultiple messages.
        */
        deserialize: function (resultNode) {
            var obj = new Object();
            var resultNodes = resultNode.childNodes;

            for (var j = 0; j < resultNodes.length; j++) {
                var k;
                var sKey;
                switch (resultNodes[j].baseName) {
                    case "Attributes":
                        var attr = resultNodes[j];
                        for (k = 0; k < attr.childNodes.length; k++) {

                            // Establish the Key for the Attribute
                            sKey = attr.childNodes[k].firstChild.text;
                            var sType = '';

                            // Determine the Type of Attribute value we should expect
                            for (var l = 0; l < attr.childNodes[k].childNodes[1].attributes.length; l++) {
                                if (attr.childNodes[k].childNodes[1].attributes[l].baseName == 'type') {
                                    sType = attr.childNodes[k].childNodes[1].attributes[l].text;
                                }
                            }
                            var entRef;
                            var entCv;
                            switch (sType) {
                                case "a:OptionSetValue":
                                    var entOsv = new xrmOptionSetValue();
                                    entOsv.type = sType.replace('a:', '');
                                    entOsv.value = parseInt(attr.childNodes[k].childNodes[1].text);
                                    obj[sKey] = entOsv;
                                    break;

                                case "a:EntityReference":
                                    entRef = new xrmEntityReference();
                                    entRef.type = sType.replace('a:', '');
                                    entRef.id = attr.childNodes[k].childNodes[1].childNodes[0].text;
                                    entRef.logicalName = attr.childNodes[k].childNodes[1].childNodes[1].text;
                                    entRef.name = attr.childNodes[k].childNodes[1].childNodes[2].text;
                                    obj[sKey] = entRef;
                                    break;

                                case "a:EntityCollection":
                                    entRef = new xrmEntityCollection();
                                    entRef.type = sType.replace('a:', '');

                                    //get all party items....
                                    var items = [];
                                    for (var y = 0; y < attr.childNodes[k].childNodes[1].childNodes[0].childNodes.length; y++) {
                                        var itemNodes = attr.childNodes[k].childNodes[1].childNodes[0].childNodes[y].childNodes[0].childNodes;
                                        for (var z = 0; z < itemNodes.length; z++) {
                                            if (itemNodes[z].childNodes[0].text == "partyid") {
                                                var itemRef = new xrmEntityReference();
                                                itemRef.id = itemNodes[z].childNodes[1].childNodes[0].text;
                                                itemRef.logicalName = itemNodes[z].childNodes[1].childNodes[1].text;
                                                itemRef.name = itemNodes[z].childNodes[1].childNodes[2].text;
                                                items[y] = itemRef;
                                            }
                                        }
                                    }
                                    entRef.value = items;
                                    obj[sKey] = entRef;
                                    break;

                                case "a:Money":
                                    entCv = new xrmValue();
                                    entCv.type = sType.replace('a:', '');
                                    entCv.value = parseFloat(attr.childNodes[k].childNodes[1].text);
                                    obj[sKey] = entCv;
                                    break;

                                default:
                                    entCv = new xrmValue();
                                    entCv.type = sType.replace('c:', '').replace('a:', '');
                                    if (entCv.type == "int") {
                                        entCv.value = parseInt(attr.childNodes[k].childNodes[1].text);
                                    }
                                    else if (entCv.type == "decimal" || entCv.type == "double") {
                                        entCv.value = parseFloat(attr.childNodes[k].childNodes[1].text);
                                    }
                                    else if (entCv.type == "dateTime") {
                                        entCv.value = new Date(attr.childNodes[k].childNodes[1].text);
                                    }
                                    else if (entCv.type == "boolean") {
                                        entCv.value = (attr.childNodes[k].childNodes[1].text == 'false') ? false : true;
                                    }
                                    else {
                                        entCv.value = attr.childNodes[k].childNodes[1].text;
                                    }
                                    obj[sKey] = entCv;
                                    break;
                            }
                        }
                        this.attributes = obj;
                        break;

                    case "Id":
                        this.id = resultNodes[j].text;
                        break;

                    case "LogicalName":
                        this.logicalName = resultNodes[j].text;
                        break;

                    case "FormattedValues":
                        var foVal = resultNodes[j];

                        for (k = 0; k < foVal.childNodes.length; k++) {
                            // Establish the Key, we are going to fill in the formatted value of the already found attribute
                            sKey = foVal.childNodes[k].firstChild.text;
                            this.attributes[sKey].formattedValue = foVal.childNodes[k].childNodes[1].text;
                            if (isNaN(this.attributes[sKey].value) && this.attributes[sKey].type == "dateTime") {
                                this.attributes[sKey].value = new Date(this.attributes[sKey].formattedValue);
                            }
                        }
                        break;
                }
            }
        }
    };

    var xmlParser = function (txt) {
        ///<summary>
        /// cross browser responseXml to return a XML object
        ///</summary>
        var xmlDoc = null;
        try {
            // code for Mozilla, Firefox, Opera, etc.
            if (window.DOMParser) {
                // ReSharper disable InconsistentNaming
                var parser = new DOMParser();
                // ReSharper restore InconsistentNaming
                xmlDoc = parser.parseFromString(txt, "text/xml");
            }
            else // Internet Explorer
            {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(txt);
            }
        } catch (e) {
            alert("Cannot convert the XML string to a cross-browser XML object.");
        }

        return xmlDoc;
    };

    var xmlToString = function (responseXml) {
        var xmlString = '';
        try {
            if (responseXml != null) {
                //IE
                if (window.ActiveXObject) {
                    xmlString = responseXml.xml;
                }
                // code for Mozilla, Firefox, Opera, etc.
                else {
                    // ReSharper disable InconsistentNaming
                    xmlString = (new XMLSerializer()).serializeToString(responseXml[0]);
                    // ReSharper restore InconsistentNaming
                }
            }
        } catch (e) {
            alert("Cannot convert the XML to a string.");
        }
        return xmlString;
    };

    var doRequest = function (soapBody, requestType, async, internalCallback) {
        async = async || false;

        // Wrap the Soap Body in a soap:Envelope.
        var soapXml =
        ["<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>",
            "<soap:Body>",
                "<", requestType, " xmlns='http://schemas.microsoft.com/xrm/2011/Contracts/Services' xmlns:i='http://www.w3.org/2001/XMLSchema-instance'>", soapBody, "</", requestType, ">",
            "</soap:Body>",
            "</soap:Envelope>"
        ].join("");

        var req = getXhr();
        req.open("POST", orgServicePath(), async);
        req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/" + requestType);

        req.send(soapXml);

        if (async) {
            req.onreadystatechange = function () {
                if (req.readyState == 4) { // "complete"
                    if (req.status == 200) { // "OK"
                        internalCallback(processResponse(req.responseXML, req.responseText));
                    }
                    else {
                        throw new Error("HTTP-Requests ERROR: " + req.statusText);
                    }
                }
            };
        }
        else {
            var result = processResponse(req.responseXML);
            return !!internalCallback ? internalCallback(result) : result;
        }
        // ReSharper disable NotAllPathsReturnValue
    };
    // ReSharper restore NotAllPathsReturnValue

    var processResponse = function (responseXml, responseText) {
        if (responseXml === null || responseXml.xml === null || responseXml.xml === "") {
            if (responseText !== null && responseText !== "")
                throw new Error(responseText);
            else
                throw new Error("No response received from the server. ");
        }

        // Report the error if occurred
        var error = $(responseXml).find("error").text();
        var faultString = $(responseXml).find("faultstring").text();

        if (error != '' || faultString != '') {
            throw new Error(error !== '' ? $(responseXml).find('description').text() : faultString);
        }

        // Load responseXML and return as an XML object
        var xmlDoc = xmlParser(xmlToString(responseXml));
        return xmlDoc;
    };

    var sCreate = function (be, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to create a new record.
        ///</summary>
        ///<param name="be" type="Object">
        /// A JavaScript object with properties corresponding to the Schema name of
        /// entity attributes that are valid for create operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var request = be.serialize();

        var async = !!callback;

        return doRequest(request, "Create", async, function (resultXml) {
            var response = $(resultXml).find('CreateResult').eq(0);

            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));

            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var sUpdate = function (be, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to update an existing record.
        ///</summary>
        ///<param name="businessEntity" type="Object">
        /// A JavaScript object with properties corresponding to the Schema name of
        /// entity attributes that are valid for update operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var request = be.serialize();

        var async = !!callback;

        return doRequest(request, "Update", async, function (resultXml) {
            var response = $(resultXml).children("#UpdateResponse").eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));

            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var sDelete = function (entityName, id, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to delete a record.
        ///</summary>
        ///<param name="entityName" type="String">
        /// A JavaScript String corresponding to the Schema name of
        /// entity that is used for delete operations.
        /// </param>
        ///<param name="id" type="String">
        /// A JavaScript String corresponding to the GUID of
        /// entity that is used for delete operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var request =
                [
                    "<entityName>", entityName, "</entityName>",
                    "<id>", id, "</id>"
                ].join("");

        var async = !!callback;

        return doRequest(request, "Delete", async, function (resultXml) {
            var response = $(resultXml).children("#DeleteResponse").eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));

            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var execute = function (request, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to execute a soap request.
        ///</summary>
        ///<param name="request" type="String">
        /// A JavaScript string corresponding to the soap request
        /// that are valid for execute operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            if (!async)
                return resultXml;
            else
                callback(resultXml);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var fetch = function (fetchXml, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a fetch request.
        ///</summary>
        ///<param name="fetchXml" type="String">
        /// A JavaScript String with properties corresponding to the fetchXml
        /// that are valid for fetch operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var msgBody = "<query i:type='a:FetchExpression' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>" +
                            "<a:Query>" +
                                ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlEncode(fetchXml) : crmXmlEncode(fetchXml)) +
                            "</a:Query>" +
                        "</query>";
        var async = !!callback;

        return doRequest(msgBody, "RetrieveMultiple", !!callback, function (resultXml) {


            var fetchResult = $(resultXml).find("a\\:Entities").eq(0)[0];
            var fetchResults = [];

            for (var i = 0; i < fetchResult.childNodes.length; i++) {
                var entity = new businessEntity();

                entity.deserialize(fetchResult.childNodes[i]);
                fetchResults[i] = entity;
            }

            if (!async)
                return fetchResults;
            else
                callback(fetchResults);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var retrieve = function (entityName, id, columnSet, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to retrieve a record.
        ///</summary>
        ///<param name="entityName" type="String">
        /// A JavaScript String corresponding to the Schema name of
        /// entity that is used for retrieve operations.
        /// </param>
        ///<param name="id" type="String">
        /// A JavaScript String corresponding to the GUID of
        /// entity that is used for retrieve operations.
        /// </param>
        ///<param name="columnSet" type="Array">
        /// A JavaScript Array corresponding to the attributes of
        /// entity that is used for retrieve operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var attributes = "";
        // ReSharper disable AssignedValueIsNeverUsed
        var query = "";
        // ReSharper restore AssignedValueIsNeverUsed
        if (columnSet != null) {
            for (var i = 0; i < columnSet.length; i++) {
                attributes += "<b:string>" + columnSet[i] + "</b:string>";
            }
            query = "<a:AllColumns>false</a:AllColumns>" +
                    "<a:Columns xmlns:b='http://schemas.microsoft.com/2003/10/Serialization/Arrays'>" +
                        attributes +
                    "</a:Columns>";
        }
        else {
            query = "<a:AllColumns>true</a:AllColumns><a:Columns xmlns:b='http://schemas.microsoft.com/2003/10/Serialization/Arrays' />";
        }

        var msgBody =
            [
                "<entityName>", entityName, "</entityName>",
                "<id>", id, "</id>",
                "<columnSet xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>",
                    query,
                "</columnSet>"
            ].join("");

        var async = !!callback;

        return doRequest(msgBody, "Retrieve", !!callback, function (resultXml) {
            var retrieveResult = $(resultXml).find("RetrieveResult").eq(0)[0];
            var entity = new businessEntity();
            entity.deserialize(retrieveResult);

            if (!async)
                return entity;
            else
                callback(entity);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var retrieveMultiple = function (query, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a retrieveMultiple request.
        ///</summary>
        ///<param name="query" type="String">
        /// A JavaScript String with properties corresponding to the retrievemultiple request
        /// that are valid for retrievemultiple operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var msgBody =
                [
                    "<query i:type='a:QueryExpression' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>", query, "</query>"
                ].join("");

        var async = !!callback;

        return doRequest(msgBody, "RetrieveMultiple", async, function (resultXml) {
            var resultNodes = $(resultXml).find("a\\:Entities").eq(0)[0];
            var retriveMultipleResults = [];

            for (var i = 0; i < resultNodes.childNodes.length; i++) {
                var entity = new businessEntity();

                entity.deserialize(resultNodes.childNodes[i]);
                retriveMultipleResults[i] = entity;
            }

            if (!async)
                return retriveMultipleResults;
            else
                callback(retriveMultipleResults);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var joinArray = function (prefix, array, suffix) {
        var output = [];
        for (var i = 0; i < array.length; i++) {
            if (array[i] != '' && array[i] != undefined) {
                output.push(prefix, array[i], suffix);
            }
        }
        return output.join("");
    };

    var joinConditionPair = function (attributes, values) {
        var output = [];
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i] != '') {
                output.push("<condition attribute='", attributes[i], "' operator='eq' value='", values[i], "' />");
            }
        }
        return output.join("");
    };

    var isArray = function (input) {
        return input.constructor.toString().indexOf("Array") != -1;
    };

    var queryByAttribute = function (queryOptions, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a queryByAttribute request.
        ///</summary>
        ///<param name="queryOptions" type="Object">
        /// A JavaScript Object with properties corresponding to the queryByAttribute Criteria
        /// that are valid for queryByAttribute operations.
        /// queryOptions.entityName is a string represents the name of the entity
        /// queryOptions.attributes is a array represents the attributes of the entity to query
        /// queryOptions.values is a array represents the values of the attributes to query
        /// queryOptions.columnSet is a array represents the attributes of the entity to return
        /// queryOptions.orderBy is a array represents the oder conditons of the results
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var entityName = queryOptions.entityName;
        var attributes = queryOptions.attributes;
        var values = queryOptions.values;
        var columnSet = queryOptions.columnSet;
        var orderBy = queryOptions.orderBy || '';

        attributes = isArray(attributes) ? attributes : [attributes];
        values = isArray(values) ? values : [values];
        orderBy = (!!orderBy && isArray(orderBy)) ? orderBy : [orderBy];
        columnSet = (!!columnSet && isArray(columnSet)) ? columnSet : [columnSet];

        for (var i = 0; i < values.length; i++) {
            values[i] = encodeValue(values[i]);
        }

        var xml =
                [
                    "<fetch mapping='logical'>",
                    "   <entity name='", entityName, "'>",
                           joinArray("<attribute name='", columnSet, "' />"),
                           joinArray("<order attribute='", orderBy, "' />"),
                    "      <filter>",
                              joinConditionPair(attributes, values),
                    "      </filter>",
                    "   </entity>",
                    "</fetch>"
                ].join("");

        return fetch(xml, callback);
    };

    var fetchMore = function (queryOptions, pageNumber, pageCookie, fetchResults) {
        var entityName = queryOptions.entityName;
        var attributes = queryOptions.attributes;
        var values = queryOptions.values;
        var columnSet = queryOptions.columnSet;
        var orderBy = queryOptions.orderBy || '';

        attributes = isArray(attributes) ? attributes : [attributes];
        values = isArray(values) ? values : [values];
        orderBy = (!!orderBy && isArray(orderBy)) ? orderBy : [orderBy];
        columnSet = (!!columnSet && isArray(columnSet)) ? columnSet : [columnSet];

        for (var i = 0; i < values.length; i++) {
            values[i] = encodeValue(values[i]);
        }

        //Build new query
        var moreFetchXml =
                [
                    "<fetch mapping='logical' page='" + pageNumber + "' count='5000' paging-cookie='" + pageCookie + "'>",
                    "   <entity name='", entityName, "'>",
                           joinArray("<attribute name='", columnSet, "' />"),
                           joinArray("<order attribute='", orderBy, "' />"),
                    "      <filter>",
                              joinConditionPair(attributes, values),
                    "      </filter>",
                    "   </entity>",
                    "</fetch>"
                ].join("");

        var moreMsgBody = "<query i:type='a:FetchExpression' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>" +
                            "<a:Query>" +
                                ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlEncode(moreFetchXml) : crmXmlEncode(moreFetchXml)) +
                            "</a:Query>" +
                        "</query>";


        return doRequest(moreMsgBody, "RetrieveMultiple", false, function (moreResultXml) {
            var newFetchResult = $(moreResultXml).find("a\\:Entities").eq(0)[0];
            var newMoreRecords = $(moreResultXml).find("a\\:MoreRecords").eq(0)[0].firstChild.text === "true";
            var newPageCookie = $(moreResultXml).find("a\\:PagingCookie").eq(0)[0].firstChild.text.replace(/\"/g, '\'').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;');

            for (var iii = 0; iii < newFetchResult.childNodes.length; iii++) {
                var entity = new businessEntity();

                entity.deserialize(newFetchResult.childNodes[iii]);
                fetchResults.push(entity);
            }

            if (newMoreRecords) {
                pageNumber += 1;
                fetchMore(queryOptions, pageNumber, newPageCookie, fetchResults);
            }
        });
    };

    var queryAll = function (queryOptions, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a queryAll request. This is to return all records (>5k+).
        /// Consider Performance impact when using this method.
        ///</summary>
        ///<param name="queryOptions" type="Object">
        /// A JavaScript Object with properties corresponding to the queryByAttribute Criteria
        /// that are valid for queryByAttribute operations.
        /// queryOptions.entityName is a string represents the name of the entity
        /// queryOptions.attributes is a array represents the attributes of the entity to query
        /// queryOptions.values is a array represents the values of the attributes to query
        /// queryOptions.columnSet is a array represents the attributes of the entity to return
        /// queryOptions.orderBy is a array represents the oder conditons of the results
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var entityName = queryOptions.entityName;
        var attributes = queryOptions.attributes;
        var values = queryOptions.values;
        var columnSet = queryOptions.columnSet;
        var orderBy = queryOptions.orderBy || '';

        attributes = isArray(attributes) ? attributes : [attributes];
        values = isArray(values) ? values : [values];
        orderBy = (!!orderBy && isArray(orderBy)) ? orderBy : [orderBy];
        columnSet = (!!columnSet && isArray(columnSet)) ? columnSet : [columnSet];

        for (var i = 0; i < values.length; i++) {
            values[i] = encodeValue(values[i]);
        }

        var fetchXml =
                [
                    "<fetch mapping='logical'>",
                    "   <entity name='", entityName, "'>",
                           joinArray("<attribute name='", columnSet, "' />"),
                           joinArray("<order attribute='", orderBy, "' />"),
                    "      <filter>",
                              joinConditionPair(attributes, values),
                    "      </filter>",
                    "   </entity>",
                    "</fetch>"
                ].join("");

        var msgBody = "<query i:type='a:FetchExpression' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>" +
                            "<a:Query>" +
                                ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlEncode(fetchXml) : crmXmlEncode(fetchXml)) +
                            "</a:Query>" +
                        "</query>";
        var async = !!callback;

        return doRequest(msgBody, "RetrieveMultiple", !!callback, function (resultXml) {

            //Logic here is inspired by http://nishantrana.wordpress.com/2012/09/11/paging-cookie-is-required-when-trying-to-retrieve-a-set-of-records-on-any-high-pages-error-in-crm-2011/
            
            var fetchResult = $(resultXml).find("a\\:Entities").eq(0)[0];
            var moreRecords = $(resultXml).find("a\\:MoreRecords").eq(0)[0].firstChild.text === "true";
            var pageCookie = $(resultXml).find("a\\:PagingCookie").eq(0)[0].firstChild.text.replace(/\"/g, '\'').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;'); ;

            var fetchResults = [];

            for (var ii = 0; ii < fetchResult.childNodes.length; ii++) {
                var entity = new businessEntity();

                entity.deserialize(fetchResult.childNodes[ii]);
                fetchResults.push(entity);
            }

            if (moreRecords) {
                var pageNumber = 2;
                fetchMore(queryOptions, pageNumber, pageCookie, fetchResults);
            }

            if (!async)
                return fetchResults;
            else
                callback(fetchResults);
            // ReSharper disable NotAllPathsReturnValue
        });
    };

    var setState = function (entityName, id, stateCode, statusCode, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to setState of a record.
        ///</summary>
        ///<param name="entityName" type="String">
        /// A JavaScript String corresponding to the Schema name of
        /// entity that is used for setState operations.
        /// </param>
        ///<param name="id" type="String">
        /// A JavaScript String corresponding to the GUID of
        /// entity that is used for setState operations.
        /// </param>
        ///<param name="stateCode" type="Int">
        /// A JavaScript Integer corresponding to the value of
        /// entity state that is used for setState operations.
        /// </param>
        ///<param name="statusCode" type="Int">
        /// A JavaScript Integer corresponding to the value of
        /// entity status that is used for setState operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var request = [
            "<request i:type='b:SetStateRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>",
                "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>",
                    "<a:KeyValuePairOfstringanyType>",
                        "<c:key>EntityMoniker</c:key>",
                        "<c:value i:type='a:EntityReference'>",
                          "<a:Id>", id, "</a:Id>",
                          "<a:LogicalName>", entityName, "</a:LogicalName>",
                          "<a:Name i:nil='true' />",
                        "</c:value>",
                      "</a:KeyValuePairOfstringanyType>",
                      "<a:KeyValuePairOfstringanyType>",
                        "<c:key>State</c:key>",
                        "<c:value i:type='a:OptionSetValue'>",
                          "<a:Value>", stateCode.toString(), "</a:Value>",
                        "</c:value>",
                      "</a:KeyValuePairOfstringanyType>",
                      "<a:KeyValuePairOfstringanyType>",
                        "<c:key>Status</c:key>",
                        "<c:value i:type='a:OptionSetValue'>",
                          "<a:Value>", statusCode.toString(), "</a:Value>",
                        "</c:value>",
                      "</a:KeyValuePairOfstringanyType>",
                "</a:Parameters>",
                "<a:RequestId i:nil='true' />",
                "<a:RequestName>SetState</a:RequestName>",
            "</request>"
        ].join("");

        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('ExecuteResult').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var associate = function (relationshipName, targetEntityName, targetId, relatedEntityName, relatedBusinessEntities, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to associate records.
        ///</summary>
        ///<param name="relationshipName" type="String">
        /// A JavaScript String corresponding to the relationship name
        /// that is used for associate operations.
        /// </param>
        ///<param name="targetEntityName" type="String">
        /// A JavaScript String corresponding to the schema name of the target entity
        /// that is used for associate operations.
        /// </param>
        ///<param name="targetId" type="String">
        /// A JavaScript String corresponding to the GUID of the target entity
        /// that is used for associate operations.
        /// </param>
        ///<param name="relatedEntityName" type="String">
        /// A JavaScript String corresponding to the schema name of the related entity
        /// that is used for associate operations.
        /// </param>
        ///<param name="relationshipBusinessEntities" type="Array">
        /// A JavaScript Array corresponding to the collection of the related entities as BusinessEntity
        /// that is used for associate operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var relatedEntities = relatedBusinessEntities;

        relatedEntities = isArray(relatedEntities) ? relatedEntities : [relatedEntities];

        var output = [];
        for (var i = 0; i < relatedEntities.length; i++) {
            if (relatedEntities[i].id != '') {
                output.push("<a:EntityReference>",
                                "<a:Id>", relatedEntities[i].id, "</a:Id>",
                                "<a:LogicalName>", relatedEntityName, "</a:LogicalName>",
                                "<a:Name i:nil='true' />",
                            "</a:EntityReference>");
            }
        }

        var relatedXml = output.join("");

        var request = [
            "<request i:type='a:AssociateRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>",
                "<a:Parameters xmlns:b='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>",
                    "<a:KeyValuePairOfstringanyType>",
                        "<b:key>Target</b:key>",
                        "<b:value i:type='a:EntityReference'>",
                            "<a:Id>", targetId, "</a:Id>",
                            "<a:LogicalName>", targetEntityName, "</a:LogicalName>",
                            "<a:Name i:nil='true' />",
                        "</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "<a:KeyValuePairOfstringanyType>",
                        "<b:key>Relationship</b:key>",
                        "<b:value i:type='a:Relationship'>",
                            "<a:PrimaryEntityRole i:nil='true' />",
                            "<a:SchemaName>", relationshipName, "</a:SchemaName>",
                        "</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "<a:KeyValuePairOfstringanyType>",
                    "<b:key>RelatedEntities</b:key>",
                    "<b:value i:type='a:EntityReferenceCollection'>",
                        relatedXml,
                    "</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                "</a:Parameters>",
                "<a:RequestId i:nil='true' />",
                "<a:RequestName>Associate</a:RequestName>",
            "</request>"
        ].join("");

        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('ExecuteResult').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var disassociate = function (relationshipName, targetEntityName, targetId, relatedEntityName, relatedBusinessEntities, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to disassociate records.
        ///</summary>
        ///<param name="relationshipName" type="String">
        /// A JavaScript String corresponding to the relationship name
        /// that is used for disassociate operations.
        /// </param>
        ///<param name="targetEntityName" type="String">
        /// A JavaScript String corresponding to the schema name of the target entity
        /// that is used for disassociate operations.
        /// </param>
        ///<param name="targetId" type="String">
        /// A JavaScript String corresponding to the GUID of the target entity
        /// that is used for disassociate operations.
        /// </param>
        ///<param name="relatedEntityName" type="String">
        /// A JavaScript String corresponding to the schema name of the related entity
        /// that is used for disassociate operations.
        /// </param>
        ///<param name="relationshipBusinessEntities" type="Array">
        /// A JavaScript Array corresponding to the collection of the related entities as BusinessEntity
        /// that is used for disassociate operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>
        var relatedEntities = relatedBusinessEntities;

        relatedEntities = isArray(relatedEntities) ? relatedEntities : [relatedEntities];

        var output = [];
        for (var i = 0; i < relatedEntities.length; i++) {
            if (relatedEntities[i].id != '') {
                output.push("<a:EntityReference>",
                                "<a:Id>", relatedEntities[i].id, "</a:Id>",
                                "<a:LogicalName>", relatedEntityName, "</a:LogicalName>",
                                "<a:Name i:nil='true' />",
                            "</a:EntityReference>");
            }
        }

        var relatedXml = output.join("");

        var request = [
            "<request i:type='a:DisassociateRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>",
                "<a:Parameters xmlns:b='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>",
                    "<a:KeyValuePairOfstringanyType>",
                        "<b:key>Target</b:key>",
                        "<b:value i:type='a:EntityReference'>",
                            "<a:Id>", targetId, "</a:Id>",
                            "<a:LogicalName>", targetEntityName, "</a:LogicalName>",
                            "<a:Name i:nil='true' />",
                        "</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "<a:KeyValuePairOfstringanyType>",
                        "<b:key>Relationship</b:key>",
                        "<b:value i:type='a:Relationship'>",
                            "<a:PrimaryEntityRole i:nil='true' />",
                            "<a:SchemaName>", relationshipName, "</a:SchemaName>",
                        "</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "<a:KeyValuePairOfstringanyType>",
                    "<b:key>RelatedEntities</b:key>",
                    "<b:value i:type='a:EntityReferenceCollection'>",
                        relatedXml,
                    "</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                "</a:Parameters>",
                "<a:RequestId i:nil='true' />",
                "<a:RequestName>Disassociate</a:RequestName>",
            "</request>"
        ].join("");

        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('ExecuteResult').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var getCurrentUserId = function () {
        ///<summary>
        /// Sends synchronous request to retrieve the GUID of the current user.
        ///</summary>
        var request = "<request i:type='b:WhoAmIRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>" +
                        "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic' />" +
                        "<a:RequestId i:nil='true' />" +
                        "<a:RequestName>WhoAmI</a:RequestName>" +
                      "</request>";
        var xmlDoc = doRequest(request, "Execute");

        return $(xmlDoc).find('a\\:Results').children().eq(0).children().eq(1).text();
    };

    var getCurrentUserBusinessUnitId = function () {
        ///<summary>
        /// Sends synchronous request to retrieve the GUID of the current user's business unit.
        ///</summary>
        var request = "<request i:type='b:WhoAmIRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>" +
                        "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic' />" +
                        "<a:RequestId i:nil='true' />" +
                        "<a:RequestName>WhoAmI</a:RequestName>" +
                      "</request>";
        var xmlDoc = doRequest(request, "Execute");

        return $(xmlDoc).find('a\\:Results').children().eq(1).children().eq(1).text();
    };

    var getCurrentUserRoles = function () {
        ///<summary>
        /// Sends synchronous request to retrieve the list of the current user's roles.
        ///</summary>
        var xml =
                [
                    "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>" +
                      "<entity name='role'>" +
                        "<attribute name='name' />" +
                        "<attribute name='businessunitid' />" +
                        "<attribute name='roleid' />" +
                        "<order attribute='name' descending='false' />" +
                        "<link-entity name='systemuserroles' from='roleid' to='roleid' visible='false' intersect='true'>" +
                          "<link-entity name='systemuser' from='systemuserid' to='systemuserid' alias='aa'>" +
                            "<filter type='and'>" +
                              "<condition attribute='systemuserid' operator='eq-userid' />" +
                            "</filter>" +
                          "</link-entity>" +
                        "</link-entity>" +
                      "</entity>" +
                    "</fetch>"
                ].join("");

        var fetchResult = fetch(xml);
        var roles = [];

        if (fetchResult !== null) {
            for (var i = 0; i < fetchResult.length; i++) {
                roles[i] = fetchResult[i].attributes["name"].value;
            }
        }

        return roles;
    };

    var isCurrentUserInRole = function () {
        ///<summary>
        /// Sends synchronous request to check if the current user has certain roles
        /// Passs name of role as arguments. For example, IsCurrentUserInRole('System Administrator')
        /// Returns true or false.
        ///</summary>
        var roles = getCurrentUserRoles();
        for (var i = 0; i < roles.length; i++) {
            for (var j = 0; j < arguments.length; j++) {
                if (roles[i] === arguments[j]) {
                    return true;
                }
            }
        }

        return false;
    };

    var assign = function (targetEntityName, targetId, assigneeEntityName, assigneeId, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to assign an existing record to a user / a team.
        ///</summary>
        ///<param name="targetEntityName" type="String">
        /// A JavaScript String corresponding to the schema name of the target entity
        /// that is used for assign operations.
        /// </param>
        ///<param name="targetId" type="String">
        /// A JavaScript String corresponding to the GUID of the target entity
        /// that is used for assign operations.
        /// </param>
        ///<param name="assigneeEntityName" type="String">
        /// A JavaScript String corresponding to the schema name of the assignee entity
        /// that is used for assign operations.
        /// </param>
        ///<param name="assigneeId" type="String">
        /// A JavaScript String corresponding to the GUID of the assignee entity
        /// that is used for assign operations.
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>

        var request = "<request i:type='b:AssignRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>" +
                        "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" +
                          "<a:KeyValuePairOfstringanyType>" +
                            "<c:key>Target</c:key>" +
                            "<c:value i:type='a:EntityReference'>" +
                              "<a:Id>" + targetId + "</a:Id>" +
                              "<a:LogicalName>" + targetEntityName + "</a:LogicalName>" +
                              "<a:Name i:nil='true' />" +
                            "</c:value>" +
                          "</a:KeyValuePairOfstringanyType>" +
                          "<a:KeyValuePairOfstringanyType>" +
                            "<c:key>Assignee</c:key>" +
                            "<c:value i:type='a:EntityReference'>" +
                              "<a:Id>" + assigneeId + "</a:Id>" +
                              "<a:LogicalName>" + assigneeEntityName + "</a:LogicalName>" +
                              "<a:Name i:nil='true' />" +
                            "</c:value>" +
                          "</a:KeyValuePairOfstringanyType>" +
                        "</a:Parameters>" +
                        "<a:RequestId i:nil='true' />" +
                        "<a:RequestName>Assign</a:RequestName>" +
                      "</request>";
        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('ExecuteResult').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var grantAccess = function (accessOptions, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a grantAccess request.
        /// Levels of Access Options are: AppendAccess, AppendToAccess, AssignAccess, CreateAccess, DeleteAccess, None, ReadAccess, ShareAccess, and WriteAccess
        ///</summary>
        ///<param name="accessOptions" type="Object">
        /// A JavaScript Object with properties corresponding to the grantAccess Criteria
        /// that are valid for grantAccess operations.
        /// accessOptions.targetEntityName is a string represents the name of the target entity
        /// accessOptions.targetEntityId is a string represents the GUID of the target entity
        /// accessOptions.principalEntityName is a string represents the name of the principal entity
        /// accessOptions.principalEntityId is a string represents the GUID of the principal entity
        /// accessOptions.accessRights is a array represents the access conditons of the results
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>

        var targetEntityName = accessOptions.targetEntityName;
        var targetEntityId = accessOptions.targetEntityId;
        var principalEntityName = accessOptions.principalEntityName;
        var principalEntityId = accessOptions.principalEntityId;
        var accessRights = accessOptions.accessRights;

        accessRights = isArray(accessRights) ? accessRights : [accessRights];

        var accessRightString = "";
        for (var i = 0; i < accessRights.length; i++) {
            accessRightString += encodeValue(accessRights[i]) + " ";
        }

        var request = "<request i:type='b:GrantAccessRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>" +
	                    "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>Target</c:key>" +
		                    "<c:value i:type='a:EntityReference'>" +
		                      "<a:Id>" + targetEntityId + "</a:Id>" +
		                      "<a:LogicalName>" + targetEntityName + "</a:LogicalName>" +
		                      "<a:Name i:nil='true' />" +
		                    "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>PrincipalAccess</c:key>" +
		                    "<c:value i:type='b:PrincipalAccess'>" +
		                      "<b:AccessMask>" + accessRightString + "</b:AccessMask>" +
		                      "<b:Principal>" +
			                    "<a:Id>" + principalEntityId + "</a:Id>" +
			                    "<a:LogicalName>" + principalEntityName + "</a:LogicalName>" +
			                    "<a:Name i:nil='true' />" +
		                      "</b:Principal>" +
		                    "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                    "</a:Parameters>" +
	                    "<a:RequestId i:nil='true' />" +
	                    "<a:RequestName>GrantAccess</a:RequestName>" +
                    "</request>";
        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('ExecuteResult').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var modifyAccess = function (accessOptions, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a modifyAccess request.
        /// Levels of Access Options are: AppendAccess, AppendToAccess, AssignAccess, CreateAccess, DeleteAccess, None, ReadAccess, ShareAccess, and WriteAccess
        ///</summary>
        ///<param name="accessOptions" type="Object">
        /// A JavaScript Object with properties corresponding to the modifyAccess Criteria
        /// that are valid for modifyAccess operations.
        /// accessOptions.targetEntityName is a string represents the name of the target entity
        /// accessOptions.targetEntityId is a string represents the GUID of the target entity
        /// accessOptions.principalEntityName is a string represents the name of the principal entity
        /// accessOptions.principalEntityId is a string represents the GUID of the principal entity
        /// accessOptions.accessRights is a array represents the access conditons of the results
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>

        var targetEntityName = accessOptions.targetEntityName;
        var targetEntityId = accessOptions.targetEntityId;
        var principalEntityName = accessOptions.principalEntityName;
        var principalEntityId = accessOptions.principalEntityId;
        var accessRights = accessOptions.accessRights;

        accessRights = isArray(accessRights) ? accessRights : [accessRights];

        var accessRightString = "";
        for (var i = 0; i < accessRights.length; i++) {
            accessRightString += encodeValue(accessRights[i]) + " ";
        }

        var request = "<request i:type='b:ModifyAccessRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>" +
	                    "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>Target</c:key>" +
		                    "<c:value i:type='a:EntityReference'>" +
		                      "<a:Id>" + targetEntityId + "</a:Id>" +
		                      "<a:LogicalName>" + targetEntityName + "</a:LogicalName>" +
		                      "<a:Name i:nil='true' />" +
		                    "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>PrincipalAccess</c:key>" +
		                    "<c:value i:type='b:PrincipalAccess'>" +
		                      "<b:AccessMask>" + accessRightString + "</b:AccessMask>" +
		                      "<b:Principal>" +
			                    "<a:Id>" + principalEntityId + "</a:Id>" +
			                    "<a:LogicalName>" + principalEntityName + "</a:LogicalName>" +
			                    "<a:Name i:nil='true' />" +
		                      "</b:Principal>" +
		                    "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                    "</a:Parameters>" +
	                    "<a:RequestId i:nil='true' />" +
	                    "<a:RequestName>ModifyAccess</a:RequestName>" +
                    "</request>";
        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('ExecuteResult').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var revokeAccess = function (accessOptions, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a revokeAccess request.
        ///</summary>
        ///<param name="accessOptions" type="Object">
        /// A JavaScript Object with properties corresponding to the revokeAccess Criteria
        /// that are valid for revokeAccess operations.
        /// accessOptions.targetEntityName is a string represents the name of the target entity
        /// accessOptions.targetEntityId is a string represents the GUID of the target entity
        /// accessOptions.revokeeEntityName is a string represents the name of the revokee entity
        /// accessOptions.revokeeEntityId is a string represents the GUID of the revokee entity
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>

        var targetEntityName = accessOptions.targetEntityName;
        var targetEntityId = accessOptions.targetEntityId;
        var revokeeEntityName = accessOptions.revokeeEntityName;
        var revokeeEntityId = accessOptions.revokeeEntityId;

        var request = "<request i:type='b:RevokeAccessRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>" +
	                    "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>Target</c:key>" +
		                    "<c:value i:type='a:EntityReference'>" +
		                      "<a:Id>" + targetEntityId + "</a:Id>" +
		                      "<a:LogicalName>" + targetEntityName + "</a:LogicalName>" +
		                      "<a:Name i:nil='true' />" +
		                    "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>Revokee</c:key>" +
                            "<c:value i:type='a:EntityReference'>" +
                              "<a:Id>" + revokeeEntityId + "</a:Id>" +
                              "<a:LogicalName>" + revokeeEntityName + "</a:LogicalName>" +
                              "<a:Name i:nil='true' />" +
                            "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                    "</a:Parameters>" +
	                    "<a:RequestId i:nil='true' />" +
	                    "<a:RequestName>RevokeAccess</a:RequestName>" +
                    "</request>";
        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('ExecuteResult').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    var retrievePrincipalAccess = function (accessOptions, callback) {
        ///<summary>
        /// Sends synchronous/asynchronous request to do a retrievePrincipalAccess request.
        ///</summary>
        ///<param name="accessOptions" type="Object">
        /// A JavaScript Object with properties corresponding to the retrievePrincipalAccess Criteria
        /// that are valid for retrievePrincipalAccess operations.
        /// accessOptions.targetEntityName is a string represents the name of the target entity
        /// accessOptions.targetEntityId is a string represents the GUID of the target entity
        /// accessOptions.principalEntityName is a string represents the name of the principal entity
        /// accessOptions.principalEntityId is a string represents the GUID of the principal entity
        /// </param>
        ///<param name="callback" type="Function">
        /// A Function used for asynchronous request. If not defined, it sends a synchronous request.
        /// </param>

        var targetEntityName = accessOptions.targetEntityName;
        var targetEntityId = accessOptions.targetEntityId;
        var principalEntityName = accessOptions.principalEntityName;
        var principalEntityId = accessOptions.principalEntityId;

        var request = "<request i:type='b:RetrievePrincipalAccessRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts' xmlns:b='http://schemas.microsoft.com/crm/2011/Contracts'>" +
	                    "<a:Parameters xmlns:c='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>Target</c:key>" +
		                    "<c:value i:type='a:EntityReference'>" +
		                      "<a:Id>" + targetEntityId + "</a:Id>" +
		                      "<a:LogicalName>" + targetEntityName + "</a:LogicalName>" +
		                      "<a:Name i:nil='true' />" +
		                    "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                      "<a:KeyValuePairOfstringanyType>" +
		                    "<c:key>Principal</c:key>" +
                            "<c:value i:type='a:EntityReference'>" +
                              "<a:Id>" + principalEntityId + "</a:Id>" +
                              "<a:LogicalName>" + principalEntityName + "</a:LogicalName>" +
                              "<a:Name i:nil='true' />" +
                            "</c:value>" +
	                      "</a:KeyValuePairOfstringanyType>" +
	                    "</a:Parameters>" +
	                    "<a:RequestId i:nil='true' />" +
	                    "<a:RequestName>RetrievePrincipalAccess</a:RequestName>" +
                    "</request>";
        var async = !!callback;

        return doRequest(request, "Execute", async, function (resultXml) {
            var response = $(resultXml).find('c\\:value').eq(0);
            var result = ((typeof window.CrmEncodeDecode != 'undefined') ? window.CrmEncodeDecode.CrmXmlDecode(response.text()) : crmXmlDecode(response.text()));
            if (!async)
                return result;
            else
                callback(result);
            // ReSharper disable NotAllPathsReturnValue
        });
        // ReSharper restore NotAllPathsReturnValue
    };

    //Toolkit's Return Static Methods
    return {
        BusinessEntity: businessEntity,
        Execute: execute,
        Fetch: fetch,
        Retrieve: retrieve,
        RetrieveMultiple: retrieveMultiple,
        Create: sCreate,
        Update: sUpdate,
        Delete: sDelete,
        QueryByAttribute: queryByAttribute,
        QueryAll: queryAll,
        SetState: setState,
        Associate: associate,
        Disassociate: disassociate,
        Assign: assign,
        RetrievePrincipalAccess: retrievePrincipalAccess,
        GrantAccess: grantAccess,
        ModifyAccess: modifyAccess,
        RevokeAccess: revokeAccess,
        GetCurrentUserId: getCurrentUserId,
        GetCurrentUserBusinessUnitId: getCurrentUserBusinessUnitId,
        GetCurrentUserRoles: getCurrentUserRoles,
        IsCurrentUserRole: isCurrentUserInRole
    };
} ();

XrmServiceToolkit.Extension = function () {
    // jQuery Load Help function to add tooltip for attribute in CRM 2011. Unsupported because of the usage of DOM object edit.
    //****************************************************
    var jQueryXrmFieldTooltip = function (filename, bDisplayImg) {
        ///<summary>
        /// A generic configurable method to add tooltip to crm 2011 field. 
        ///</summary>
        ///<param name="filename" type="String">
        /// A JavaScript String corresponding the name of the configuration web resource name in CRM 2011 instance
        /// </param>
        ///<param name="bDisplayImg" type="boolean">
        /// A JavaScript boolean corresponding if display a help image for the tooltip
        /// </param>

        /*
        This function is used add tooltips to any field in CRM2011.

        This function requires the following parameters:
        filename :   name of the XML webresource
        bDisplayImg: bolean to show/hide the help image (true/false)
        Returns: nothing
        Example:  jQueryLoadHelp('cm_xmlhelpfile', true);
        Designed by: http://lambrite.com/?p=221
        Adaptd by   Geron Profet (www.crmxpg.nl), Jaimie Ji
        Modified by Jaimie ji with jQuery and cross browser
        */

        if (typeof jQuery == 'undefined') {
            alert('jQuery is not loaded.\nPlease ensure that jQuery is included\n as webresource in the form load.');
            return;
        }

        jQuery.support.cors = true;

        $.ajax({
            type: "GET",
            url: "../WebResources/" + filename,
            dataType: "xml",
            success: parseHelpXml,
            // ReSharper disable UnusedParameter
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                // ReSharper restore UnusedParameter
                alert('Something is wrong to setup the tooltip for the fields. Please contact your administrator');
            }
        }); //end ajax

        //****************************************************
        function parseHelpXml(data) {
            var entity = Xrm.Page.data.entity.getEntityName().toString().toLowerCase();
            var entXml = $("entity[name=" + entity + "]", data);
            $(entXml).children().each(function () {
                var attr = $(this).attr('name');
                var txt = $(this).find('shorthelp').text();
                registerHelp(entity, attr, txt);
            });
        }
        //****************************************************
        function registerHelp(entity, attr, txt) {
            var obj = $('#' + attr + '_c').children(':first');
            if (obj != null) {
                var html = '<img id="img_' + attr + '" src="/_imgs/ico/16_help.gif" alt="' + txt + '" width="16" height="16" /><div id="help_' + attr + '" style="visibility: hidden; position: absolute;">: ' + txt + '</div>';
                $(obj).append(html);
                //20110909 GP: added line to hide/show help image
                $('#img_' + attr).css('display', (bDisplayImg) ? 'inline' : 'none');
            }
        }
    };

    // Generic Dependent Option Set Function. Changed from CRM 2011 SDK example
    var jQueryXrmDependentOptionSet = function (filename) {
        ///<summary>
        /// A generic configurable method to configure dependent optionset for CRM 2011 instance
        ///</summary>
        ///<param name="filename" type="String">
        /// A JavaScript String corresponding the name of the configuration web resource name in CRM 2011 instance
        /// </param>
        if (typeof jQuery == 'undefined') {
            alert('jQuery is not loaded.\nPlease ensure that jQuery is included\n as webresource in the form load.');
            return;
        }

        jQuery.support.cors = true;

        $.ajax({
            type: "GET",
            url: "../WebResources/" + filename,
            dataType: "xml",
            success: init,
            // ReSharper disable UnusedParameter
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                // ReSharper restore UnusedParameter
                alert('Something is wrong to setup the dependent picklist. Please contact your administrator');
            }
        }); //end ajax

        function init(data) {
            var entity = Xrm.Page.data.entity.getEntityName().toString().toLowerCase();
            var configWr = $("entity[name=" + entity + "]", data);

            //Convert the XML Data into a JScript object.
            var parentFields = configWr.children("ParentField");
            var jsConfig = [];
            for (var i = 0; i < parentFields.length; i++) {
                var node = parentFields[i];
                var mapping = {};
                mapping.parent = $(node).attr("id");
                mapping.dependent = $(node).children("DependentField:first").attr("id");
                mapping.options = [];
                var options = $(node).children("Option");
                for (var a = 0; a < options.length; a++) {
                    var option = {};
                    option.value = $(options[a]).attr("value");
                    option.showOptions = [];
                    var optionsToShow = $(options[a]).children("ShowOption");
                    for (var b = 0; b < optionsToShow.length; b++) {
                        var optionToShow = {};
                        optionToShow.value = $(optionsToShow[b]).attr("value");
                        optionToShow.text = $(optionsToShow[b]).attr("label"); // Label is not used in the code.

                        option.showOptions.push(optionToShow);
                    }
                    mapping.options.push(option);
                }
                jsConfig.push(mapping);
            }
            // Attach the configuration object to jQueryXrmDependentOptionSet
            // so it will be available for the OnChange events.
            jQueryXrmDependentOptionSet.config = jsConfig;

            //Fire the OnChange event for the mapped optionset fields
            // so that the dependent fields are filtered for the current values.
            for (var depOptionSet in jQueryXrmDependentOptionSet.config) {
                var parent = jQueryXrmDependentOptionSet.config[depOptionSet].parent;
                var child = jQueryXrmDependentOptionSet.config[depOptionSet].dependent;
                filterDependentField(parent, child, jQueryXrmDependentOptionSet);
            }
        }

        // This is the function set on the OnChange event for
        // parent fields.
        // ReSharper disable DuplicatingLocalDeclaration
        function filterDependentField(parentField, childField, jQueryXrmDependentOptionSet) {
            // ReSharper restore DuplicatingLocalDeclaration
            for (var depOptionSet in jQueryXrmDependentOptionSet.config) {
                var dependentOptionSet = jQueryXrmDependentOptionSet.config[depOptionSet];
                /* Match the parameters to the correct dependent optionset mapping*/
                if ((dependentOptionSet.parent == parentField) && (dependentOptionSet.dependent == childField)) {
                    /* Get references to the related fields*/
                    var parent = Xrm.Page.data.entity.attributes.get(parentField);
                    var child = Xrm.Page.data.entity.attributes.get(childField);

                    var parentControl = Xrm.Page.getControl(parentField);
                    var childControl = Xrm.Page.getControl(childField);
                    /* Capture the current value of the child field*/
                    var currentChildFieldValue = child.getValue();

                    /* If the parent field is null the Child field can be set to null */
                    var controls;
                    var ctrl;
                    if (parent.getValue() == null) {
                        child.setValue(null);
                        child.setSubmitMode("always");
                        child.fireOnChange();

                        // Any attribute may have any number of controls,
                        // so disable each instance.
                        controls = child.controls.get();
                        for (ctrl in controls) {
                            controls[ctrl].setDisabled(true);
                        }
                        return;
                    }

                    for (var os in dependentOptionSet.options) {
                        var options = dependentOptionSet.options[os];
                        var optionsToShow = options.showOptions;
                        /* Find the Options that corresponds to the value of the parent field. */
                        if (parent.getValue() == options.value) {
                            controls = child.controls.get(); /*Enable the field and set the options*/
                            for (ctrl in controls) {
                                controls[ctrl].setDisabled(false);
                                controls[ctrl].clearOptions();

                                for (var option in optionsToShow) {
                                    controls[ctrl].addOption(optionsToShow[option]);
                                }
                            }
                            /*Check whether the current value is valid*/
                            var bCurrentValueIsValid = false;
                            var childFieldOptions = optionsToShow;

                            for (var validOptionIndex in childFieldOptions) {
                                var optionDataValue = childFieldOptions[validOptionIndex].value;

                                if (currentChildFieldValue == optionDataValue) {
                                    bCurrentValueIsValid = true;
                                    break;
                                }
                            }
                            /*
                            If the value is valid, set it.
                            If not, set the child field to null
                            */
                            if (bCurrentValueIsValid) {
                                child.setValue(currentChildFieldValue);
                            }
                            else {
                                child.setValue(null);
                            }
                            child.setSubmitMode("always");
                            child.fireOnChange();

                            if (parentControl.getDisabled() == true) {
                                childControl.setDisabled(true);
                            }
                            break;
                        }
                    }
                }
            }
        }
    };

    var jQueryXrmCustomFilterView = function (filename) {
        ///<summary>
        /// A generic configurable method to add custom filter view to lookup field in crm 2011 instance
        ///</summary>
        ///<param name="filename" type="String">
        /// A JavaScript String corresponding the name of the configuration web resource name in CRM 2011 instance
        /// </param>
        if (typeof jQuery == 'undefined') {
            alert('jQuery is not loaded.\nPlease ensure that jQuery is included\n as webresource in the form load.');
            return;
        }

        jQuery.support.cors = true;

        $.ajax({
            type: "GET",
            url: "../WebResources/" + filename,
            dataType: "xml",
            success: init,
            // ReSharper disable UnusedParameter
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                // ReSharper restore UnusedParameter
                alert('Something is wrong to setup the custom filter view. Please contact your administrator');
            }
        }); //end ajax

        function init(data) {
            var entity = Xrm.Page.data.entity.getEntityName().toString().toLowerCase();
            var configWr = $("entity[name=" + entity + "]", data);

            //Convert the XML Data into a JScript object.
            var targetFields = configWr.children("TargetField");
            var jsConfig = [];
            for (var i = 0; i < targetFields.length; i++) {
                var node = targetFields[i];
                var mapping = {};
                mapping.target = $(node).attr("id");
                mapping.entityName = $(node).attr("viewentity");
                mapping.viewName = $(node).attr("viewname");
                mapping.dynamic = $(node).children("dynamic").children();
                mapping.fetchXml = xmlToString($(node).children("fetch"));
                mapping.layoutXml = xmlToString($(node).children("grid"));

                jsConfig.push(mapping);
            }
            // Attach the configuration object to JQueryCustomFilterView
            // so it will be available for the OnChange events.
            jQueryXrmCustomFilterView.config = jsConfig;

            //Fire the OnChange event for the mapped fields
            // so that the lookup dialog are changed with the filtered view for the current values.
            for (var customFilterView in jQueryXrmCustomFilterView.config) {
                var target = jQueryXrmCustomFilterView.config[customFilterView].target;
                var entityName = jQueryXrmCustomFilterView.config[customFilterView].entityName;
                var viewName = jQueryXrmCustomFilterView.config[customFilterView].viewName;
                var dynamic = jQueryXrmCustomFilterView.config[customFilterView].dynamic;
                var fetchXml = jQueryXrmCustomFilterView.config[customFilterView].fetchXml;
                var layoutXml = jQueryXrmCustomFilterView.config[customFilterView].layoutXml;

                //TODO: Adding logics for various field and conditions. More tests required. 
                if (dynamic != null) {
                    for (var a = 0; a < dynamic.length; a++) {
                        var dynamicControlType = Xrm.Page.getControl($(dynamic).attr('name')).getControlType();
                        var fieldValueType = $(dynamic).attr('fieldvaluetype'); //for optionset, name might be used to filter
                        if (Xrm.Page.getAttribute($(dynamic).attr('name')).getValue() == null) {
                            alert($(dynamic).attr('name') + ' does not have a value. Please put validation logic on the field change to call this function. Only use XrmServiceToolkit.Extension.JQueryXrmCustomFilterView when the field has a value.');
                            return;
                        }
                        var dynamicValue = null;
                        switch (dynamicControlType) {
                            case 'standard':
                                dynamicValue = Xrm.Page.getAttribute($(dynamic).attr('name')).getValue();
                                break;
                            case 'optionset':
                                dynamicValue = (fieldValueType != null && fieldValueType == 'label') ? Xrm.Page.getAttribute($(dynamic).attr('name')).getSelectionOption().text : Xrm.Page.getAttribute($(dynamic).attr('name')).getValue();
                                break;
                            case 'lookup':
                                dynamicValue = (fieldValueType != null && fieldValueType == 'name') ? Xrm.Page.getAttribute($(dynamic).attr('name')).getValue()[0].name : Xrm.Page.getAttribute($(dynamic).attr('name')).getValue()[0].id;
                                break;
                            default:
                                alert($(dynamic).attr('name') + " is not supported for filter lookup view. Please change the configuration.");
                                break;
                        }

                        var operator = $(dynamic).attr('operator');
                        if (operator == null) {
                            alert('operator is missing in the configuration file. Please fix the issue');
                            return;
                        }
                        var dynamicString = $(dynamic).attr('fetchnote');
                        switch (operator.toLowerCase()) {
                            case 'contains':
                            case 'does not contain':
                                dynamicValue = '%' + dynamicValue + '%';
                                break;
                            case 'begins with':
                            case 'does not begin with':
                                dynamicValue = dynamicValue + '%';
                                break;
                            case 'ends with':
                            case 'does not end with':
                                dynamicValue = '%' + dynamicValue;
                                break;
                            default:
                                dynamicValue = dynamicValue;
                                break;
                        }

                        fetchXml = fetchXml.replace(dynamicString, dynamicValue);
                    }
                }

                //replace the values if required
                setCustomFilterView(target, entityName, viewName, fetchXml, layoutXml);
            }
        }

        function setCustomFilterView(target, entityName, viewName, fetchXml, layoutXml) {
            // use randomly generated GUID Id for our new view
            var viewId = "{1DFB2B35-B07C-44D1-868D-258DEEAB88E2}";

            // add the Custom View to the indicated [lookupFieldName] Control
            Xrm.Page.getControl(target).addCustomView(viewId, entityName, viewName, fetchXml, layoutXml, true);
        }

        function xmlToString(xmlData) {
            var xmlString = '';
            try {
                if (xmlData != null && xmlData.length > 0) {
                    //IE
                    if (window.ActiveXObject) {
                        xmlString = xmlData[0].xml;
                    }
                    // code for Mozilla, Firefox, Opera, etc.
                    else {
                        // ReSharper disable InconsistentNaming
                        xmlString = (new XMLSerializer()).serializeToString(xmlData[0]);
                        // ReSharper restore InconsistentNaming
                    }
                    return xmlString;
                }
            } catch (e) {
                alert("Cannot convert the XML to a string.");
            }
            return xmlString;
        }
    };

    // Disable or Enable to insert/edit note for entity. Unsupported because of DOM object edit
    var jQueryXrmFormatNotesControl = function (allowInsert, allowEdit) {
        ///<summary>
        /// A generic configurable method to format the note control in crm 2011 instance
        ///</summary>
        ///<param name="allowInsert" type="Boolean">
        /// A JavaScript boolean to format if the note control allow insert
        /// </param>
        ///<param name="allowEdit" type="Boolean">
        /// A JavaScript boolean to format if the note control allow edit
        /// </param>

        if (typeof jQuery == 'undefined') {
            alert('jQuery is not loaded.\nPlease ensure that jQuery is included\n as webresource in the form load.');
            return;
        }

        jQuery.support.cors = true;

        var notescontrol = $('#notescontrol');
        if (notescontrol == null) return;
        var url = notescontrol.attr('url');
        if (url == null) return;
        if (!allowInsert) {
            url = url.replace("EnableInsert=true", "EnableInsert=false");
        }
        if (!allowEdit) {
            url = url.replace("EnableInlineEdit=true", "EnableInlineEdit=false");
        }

        notescontrol.attr('url', url);

        var src = notescontrol.attr('src');
        if (src == null) return;
        if (!allowInsert) {
            src = url.replace("EnableInsert=true", "EnableInsert=false");
        }
        if (!allowEdit) {
            src = url.replace("EnableInlineEdit=true", "EnableInlineEdit=false");
        }

        notescontrol.attr('src', src);
    };

    // Toolkit's public static members
    return {
        JQueryXrmFieldTooltip: jQueryXrmFieldTooltip,
        JQueryXrmDependentOptionSet: jQueryXrmDependentOptionSet,
        JQueryXrmCustomFilterView: jQueryXrmCustomFilterView,
        JQueryXrmFormatNotesControl: jQueryXrmFormatNotesControl
    };
} ();