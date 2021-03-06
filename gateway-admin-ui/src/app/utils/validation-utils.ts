/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import {CASProviderConfig} from "../provider-config-wizard/cas-provider-config";

export class ParsedURL {

  static REGEXP: RegExp = new RegExp('^(([^:\/?#]+):)?\/\/(([^\/?#]+):([^\/?#]+))?([^?#]*)(\/?([^#]*))?(#(.*))?');

  scheme:   string;
  host:     string;
  port:     string;
  path:     string;
  query:    string;
  fragment: string;

  static parse(url: string): ParsedURL {
    let result: ParsedURL;

    let matches =  url.match(ParsedURL.REGEXP);
    if (matches && matches.length > 0) {
      result = {
          scheme:   matches[2],
          host:     matches[4],
          port:     matches[5],
          path:     matches[6],
          query:    matches[7],
          fragment: matches[9]
      };
    }
    return result;
  }
}


export class ValidationUtils {

  private static DN_TEMPLATE_REGEXP: RegExp =
    new RegExp('(?:[A-Za-z][\\w-]*|\\d+(?:\\.\\d+)*)' +
      '=(?:#(?:[\\dA-Fa-f]{2})+|(?:[^,=\\+<>#;\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*")' +
      '(?:\\+(?:[A-Za-z][\\w-]*|\\d+(?:\\.\\d+)*)' +
      '=(?:#(?:[\\dA-Fa-f]{2})' +
      '+|(?:[^,=\\+<>#;\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*"))' +
      '*(?:,(?:[A-Za-z][\\w-]*|\\d+(?:\\.\\d+)*)' +
      '=(?:#(?:[\\dA-Fa-f]{2})+|(?:[^,=\\+<>#;\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*")' +
      '(?:\\+(?:[A-Za-z][\\w-]*|\\d+(?:\\.\\d+)*)=(?:#(?:[\\dA-Fa-f]{2})+|(?:[^,=\\+<>#;\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*|"(?:[^\\"]|\\[,=\\+<>#;\\"]|\\[\\dA-Fa-f]{2})*"))*)*');


  private static PRINCIPAL_MAPPING_REGEXP = new RegExp('^(?:(?:[a-zA-Z\\*]+[\\,]?)+=[a-zA-Z]+[;]?)*$');

  static LDAP_URL_SCHEMES: string[] = [ 'ldap', 'ldaps' ];

  static HTTP_URL_SCHEMES: string[] = [ 'http', 'https' ];

  static CAS_PROTOCOLS: string[] = [ 'CAS10', 'CAS20', 'CAS20_PROXY', 'CAS30', 'CAS30_PROXY', 'SAML' ];


  static parseBoolean(value: string): boolean {
    let parsed: boolean;
    if (value) {
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        // just return undefined
      }
    }
    return parsed;
  }


  static parseURL(url: string): ParsedURL {
    return ParsedURL.parse(url);
  }


  static isValidNumber(value: string): boolean {
    return (value && !isNaN(Number(value)));
  }


  static isValidBoolean(value: string): boolean {
    return (ValidationUtils.parseBoolean(value) !== undefined);
  }

  static isValidString(value: string): boolean {
    return (value && value.length > 0);
  }

  static isValidValue(validValues: string[], value: string): boolean {
    let isValid: boolean = false;
    if (value && validValues) {
      if (validValues.indexOf(value) > -1) {
        isValid = true;
      }
    }
    return isValid;
  }


  static isValidURL(url: string): boolean {
    let isValid: boolean = false;

    let parsedURL = ValidationUtils.parseURL(url);
    if (parsedURL) {
      // Make sure it has at least a valid scheme, host and port
      if (parsedURL.scheme) {
        if (parsedURL.host) {
          if (parsedURL.port) {
            isValid = ValidationUtils.isValidNumber(parsedURL.port);
          }
        }
      }
    }

    return isValid;
  }


  static isValidURLOfScheme(url: string, acceptableSchemes?: string[]): boolean {
    let isValid: boolean = false;

    let parsedURL = ValidationUtils.parseURL(url);
    if (parsedURL) {
      // Make sure it has at least a valid scheme, host and port
      if (parsedURL.scheme) {
        if (acceptableSchemes && acceptableSchemes.indexOf(parsedURL.scheme) < 0) {
          console.debug('\tParsed URL scheme is not among acceptable schemes');
          return false;
        }
        if (parsedURL.host) {
          if (parsedURL.port) {
            isValid = ValidationUtils.isValidNumber(parsedURL.port);
          }
        }
      }
    }

    return isValid;
  }

  static isValidLdapURL(url: string): boolean {
    return ValidationUtils.isValidURLOfScheme(url, ValidationUtils.LDAP_URL_SCHEMES);
  }

  static isValidHttpURL(url: string): boolean {
    return ValidationUtils.isValidURLOfScheme(url, ValidationUtils.HTTP_URL_SCHEMES);
  }

  static isValidDNTemplate(dnTemplate: string): boolean {
    return ValidationUtils.DN_TEMPLATE_REGEXP.test(dnTemplate);
  }

  static isValidCASProtocol(protocol: string): boolean {
    let isValid: boolean = false;

    if (protocol) {
      isValid = (ValidationUtils.CAS_PROTOCOLS.indexOf(protocol) > -1);
    }

    return isValid;
  }

  static isValidPrincipalMapping(mapping: string): boolean {
    let isValid: boolean = false;

    if (mapping) {
      isValid = ValidationUtils.PRINCIPAL_MAPPING_REGEXP.test(mapping)
    }

    return isValid;
  }
}