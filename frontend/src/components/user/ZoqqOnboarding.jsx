/**
 * Zoqq Onboarding Flow Component
 * Complete implementation of Zoqq user onboarding following the API documentation
 * Features: User creation, terms acceptance, account activation, and RFI handling
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  useGetZoqqTokenMutation,
  useCreateZoqqUserMutation,
  useGetZoqqUserQuery,
  useAcceptTermsMutation,
  useActivateAccountMutation,
  useGetRFIDetailsQuery,
  useRespondToRFIMutation,
  validateZoqqUserData,
  formatZoqqUserData,
  getUserOnboardingStatus
} from '../../store/api/zoqqApi';

const ZoqqOnboarding = () => {
  // API hooks
  const [getZoqqToken] = useGetZoqqTokenMutation();
  const [createZoqqUser] = useCreateZoqqUserMutation();
  const [acceptTerms] = useAcceptTermsMutation();
  const [activateAccount] = useActivateAccountMutation();
  const [respondToRFI] = useRespondToRFIMutation();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [zoqqAccountId, setZoqqAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // User form data (following exact API documentation structure)
  const [userFormData, setUserFormData] = useState({
    // Business Information
    emailId: '',
    amount: '10',
    currency: 'USD',
    businessName: '',
    businessStructure: 'COMPANY',
    contactNumber: '',
    descriptionOfGoodsOrServices: '',
    industryCategoryCode: 'ICCV3_0000XX',
    operatingCountry: 'AU',
    
    // Business Registration
    type: 'brn',
    number: '',
    
    // Registration Address
    registrationAddressLine1: '',
    registrationAddressLine2: '',
    registrationCountryCode: 'SG',
    registrationPostcode: '',
    registrationState: '',
    registrationSuburb: '',
    
    // Residential Address
    residentialAddressLine1: '',
    residentialCountryCode: 'SG',
    residentialPostcode: '',
    residentialState: '',
    residentialSuburb: '',
    
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'SG',
    mobile: '',
    
    // Identity Documents
    identificationType: 'Passport',
    Idnumber: '',
    issuingCountryCode: 'SG',
    effectiveAt: '',
    expireAt: '',
    
    // Legal and Compliance
    roles: 'BENEFICIAL_OWNER',
    legalEntityType: 'BUSINESS',
    asTrustee: true,
    agreedToTermsAndConditions: false,
    productReference: 'ACCEPT_ONLINE_PAYMENTS',
    
    // Document Files (these would come from file upload components)
    fileId: 'NzViMjBjNzgtMjJmYy00ZTAwLWFlOGYtNmEwNTc3MDlhZmFjLHwsaG9uZ2tvbmcsfCxibGFuay5wZGZfMTc0MzQ5NTg5MTYzMA',
    tag: 'BUSINESS_LICENSE',
    frontFileId: 'NzViMjBjNzgtMjJmYy00ZTAwLWFlOGYtNmEwNTc3MDlhZmFjLHwsaG9uZ2tvbmcsfCxibGFuay5wZGZfMTc0MzQ5NTg5MTYzMA',
    personDocumentsFileId: 'NzViMjBjNzgtMjJmYy00ZTAwLWFlOGYtNmEwNTc3MDlhZmFjLHwsaG9uZ2tvbmcsfCxibGFuay5wZGZfMTc0MzQ5NTg5MTYzMA',
    personDocumentsTag: 'PERSON_PURPORTING_TO_ACT_AUTHORISATION_LETTER',
    liveSelfieFileId: 'NzViMjBjNzgtMjJmYy00ZTAwLWFlOGYtNmEwNTc3MDlhZmFjLHwsaG9uZ2tvbmcsfCxibGFuay5wZGZfMTc0MzQ5NTg5MTYzMA',
    countryCode: 'SG'
  });

  // Conditional queries based on account ID
  const {
    data: userData,
    refetch: refetchUser
  } = useGetZoqqUserQuery(zoqqAccountId, {
    skip: !zoqqAccountId
  });

  const {
    data: rfiData,
    refetch: refetchRFI
  } = useGetRFIDetailsQuery(zoqqAccountId, {
    skip: !zoqqAccountId
  });

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Step 1: Get Zoqq Authentication Token and Create User
  const handleCreateUser = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      console.log('[ZOQQ ONBOARDING] Starting user creation process...');

      // Validate form data
      const validation = validateZoqqUserData(userFormData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        toast.error('Please fix the validation errors before proceeding');
        return;
      }

      // Format data for API
      const formattedData = formatZoqqUserData(userFormData);

      // Get authentication token first
      console.log('[ZOQQ ONBOARDING] Getting authentication token...');
      const tokenResult = await getZoqqToken().unwrap();
      
      if (tokenResult.status === 'success') {
        console.log('[ZOQQ ONBOARDING] Token obtained, creating user...');
        
        // Create user with Zoqq API
        const userResult = await createZoqqUser(formattedData).unwrap();
        
        if (userResult.status === 'success') {
          setZoqqAccountId(userResult.data.accountId);
          setCurrentStep(2);
          toast.success('User account created successfully!');
          console.log('[ZOQQ ONBOARDING] User created with account ID:', userResult.data.accountId);
        }
      }
    } catch (error) {
      console.error('[ZOQQ ONBOARDING] User creation failed:', error);
      toast.error(error.message || 'Failed to create user account');
      setErrors({ general: error.message || 'Failed to create user account' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Accept Terms and Conditions
  const handleAcceptTerms = async () => {
    if (!zoqqAccountId) {
      toast.error('Account ID is required to accept terms');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ZOQQ ONBOARDING] Accepting terms for account:', zoqqAccountId);
      
      const result = await acceptTerms(zoqqAccountId).unwrap();
      
      if (result.status === 'success') {
        setCurrentStep(3);
        toast.success('Terms and conditions accepted successfully!');
        refetchUser(); // Refresh user data
      }
    } catch (error) {
      console.error('[ZOQQ ONBOARDING] Terms acceptance failed:', error);
      toast.error(error.message || 'Failed to accept terms and conditions');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Activate Account
  const handleActivateAccount = async () => {
    if (!zoqqAccountId) {
      toast.error('Account ID is required for activation');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ZOQQ ONBOARDING] Activating account:', zoqqAccountId);
      
      const result = await activateAccount(zoqqAccountId).unwrap();
      
      if (result.status === 'success') {
        setCurrentStep(4);
        toast.success('Account activated successfully!');
        refetchUser(); // Refresh user data
      }
    } catch (error) {
      console.error('[ZOQQ ONBOARDING] Account activation failed:', error);
      
      // Check if RFI is required
      if (error.code === 'RFI_REQUIRED' || error.message?.includes('RFI')) {
        setCurrentStep(5); // Go to RFI step
        refetchRFI(); // Fetch RFI details
        toast.error('Additional information required for compliance');
      } else {
        toast.error(error.message || 'Failed to activate account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Handle RFI Response (if required)
  const handleRFIResponse = async (rfiResponseData) => {
    if (!zoqqAccountId) {
      toast.error('Account ID is required for RFI response');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ZOQQ ONBOARDING] Submitting RFI response for account:', zoqqAccountId);
      
      const result = await respondToRFI({
        userId: zoqqAccountId,
        rfiResponse: rfiResponseData
      }).unwrap();
      
      if (result.status === 'success') {
        toast.success('RFI response submitted successfully!');
        refetchRFI(); // Refresh RFI data
        refetchUser(); // Refresh user data
        
        // Try to activate account again after RFI response
        setTimeout(() => {
          handleActivateAccount();
        }, 2000);
      }
    } catch (error) {
      console.error('[ZOQQ ONBOARDING] RFI response failed:', error);
      toast.error(error.message || 'Failed to submit RFI response');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current onboarding status
  const onboardingStatus = getUserOnboardingStatus(userData?.data);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Zoqq Account Onboarding
        </h1>
        <p className="text-gray-600">
          Complete your Zoqq account setup following the secure onboarding process
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step < 4 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 flex-1 mx-4 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}>
            Create Account
          </span>
          <span className={currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}>
            Accept Terms
          </span>
          <span className={currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}>
            Activate
          </span>
          <span className={currentStep >= 4 ? 'text-blue-600' : 'text-gray-500'}>
            Complete
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: User Creation Form */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Step 1: Account Information</h2>
            
            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userFormData.emailId}
                  onChange={(e) => handleInputChange('emailId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.emailId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
                {errors.emailId && (
                  <p className="text-red-500 text-sm mt-1">{errors.emailId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={userFormData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="STYLOPAY Pty Ltd"
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={userFormData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={userFormData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={userFormData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="912500678"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={userFormData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number *
                </label>
                <input
                  type="text"
                  value={userFormData.Idnumber}
                  onChange={(e) => handleInputChange('Idnumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.Idnumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="X1234567"
                />
                {errors.Idnumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.Idnumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Registration Number *
                </label>
                <input
                  type="text"
                  value={userFormData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234567890"
                />
                {errors.number && (
                  <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Registration Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={userFormData.registrationAddressLine1}
                    onChange={(e) => handleInputChange('registrationAddressLine1', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.registrationAddressLine1 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Market Street"
                  />
                  {errors.registrationAddressLine1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationAddressLine1}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={userFormData.registrationPostcode}
                    onChange={(e) => handleInputChange('registrationPostcode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.registrationPostcode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="2000"
                  />
                  {errors.registrationPostcode && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationPostcode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={userFormData.registrationState}
                    onChange={(e) => handleInputChange('registrationState', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.registrationState ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="NSW"
                  />
                  {errors.registrationState && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationState}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suburb *
                  </label>
                  <input
                    type="text"
                    value={userFormData.registrationSuburb}
                    onChange={(e) => handleInputChange('registrationSuburb', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.registrationSuburb ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Sydney"
                  />
                  {errors.registrationSuburb && (
                    <p className="text-red-500 text-sm mt-1">{errors.registrationSuburb}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={userFormData.agreedToTermsAndConditions}
                onChange={(e) => handleInputChange('agreedToTermsAndConditions', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the terms and conditions *
              </label>
            </div>
            {errors.agreedToTermsAndConditions && (
              <p className="text-red-500 text-sm">{errors.agreedToTermsAndConditions}</p>
            )}

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            <button
              onClick={handleCreateUser}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Zoqq Account'}
            </button>
          </div>
        )}

        {/* Step 2: Accept Terms */}
        {currentStep === 2 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">Step 2: Accept Terms and Conditions</h2>
            <p className="text-gray-600">
              Account created successfully! Account ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{zoqqAccountId}</span>
            </p>
            <p className="text-gray-600">
              Please review and accept the terms and conditions to proceed with account activation.
            </p>
            
            <div className="bg-gray-50 border rounded-md p-6 text-left">
              <h3 className="font-medium mb-2">Terms and Conditions Summary:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Account will be subject to compliance verification</li>
                <li>• Additional documentation may be requested (RFI)</li>
                <li>• Service agreement includes data usage consent</li>
                <li>• Full activation requires successful verification</li>
              </ul>
            </div>

            <button
              onClick={handleAcceptTerms}
              disabled={isLoading}
              className="bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Accepting Terms...' : 'Accept Terms and Conditions'}
            </button>
          </div>
        )}

        {/* Step 3: Account Activation */}
        {currentStep === 3 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">Step 3: Account Activation</h2>
            <p className="text-gray-600">
              Terms accepted successfully! Now activate your account for full access.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
              <h3 className="font-medium text-blue-800 mb-2">Activation Process:</h3>
              <p className="text-blue-700 text-sm">
                The system will verify your information and activate your account. 
                If additional information is required, you'll be guided through the RFI process.
              </p>
            </div>

            <button
              onClick={handleActivateAccount}
              disabled={isLoading}
              className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Activating Account...' : 'Activate Account'}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-green-600">Account Activated Successfully!</h2>
            <p className="text-gray-600">
              Your Zoqq account is now fully activated and ready to use.
            </p>
            
            {userData && (
              <div className="bg-green-50 border border-green-200 rounded-md p-6 text-left">
                <h3 className="font-medium text-green-800 mb-2">Account Details:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Account ID:</strong> {zoqqAccountId}</p>
                  <p><strong>Status:</strong> {userData.data?.status || 'Active'}</p>
                  <p><strong>Email:</strong> {userData.data?.primary_contact?.email}</p>
                  <p><strong>Legal Entity ID:</strong> {userData.data?.account_details?.legal_entity_id}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => refetchUser()}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Refresh Account Data
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Step 5: RFI Handling (if required) */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Additional Information Required (RFI)</h2>
            <p className="text-gray-600">
              Additional verification is required to complete your account activation.
            </p>
            
            {rfiData && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-6">
                <h3 className="font-medium text-orange-800 mb-4">Required Information:</h3>
                
                {rfiData.data?.active_request?.questions?.map((question, index) => (
                  <div key={question.id || index} className="mb-6 last:mb-0">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {question.title?.en || question.key}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {question.description?.en || 'Please provide the requested information'}
                    </p>
                    
                    {/* Simple RFI response form - can be expanded based on question type */}
                    <button
                      onClick={() => handleRFIResponse({
                        id: question.id,
                        type: 'ADDRESS',
                        address_line1: '200 Collins Street',
                        address_line2: '',
                        country_code: 'AU',
                        postcode: '3000',
                        state: 'VIC',
                        suburb: 'Melbourne'
                      })}
                      disabled={isLoading}
                      className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Sample Response'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Status Display */}
      {userData && (
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Current Status:</h3>
          <div className="text-sm text-gray-600">
            <p><strong>Onboarding Step:</strong> {onboardingStatus.step} of {onboardingStatus.totalSteps}</p>
            <p><strong>Status:</strong> {onboardingStatus.status}</p>
            <p><strong>Next Action:</strong> {onboardingStatus.nextAction}</p>
            <p><strong>Description:</strong> {onboardingStatus.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoqqOnboarding; 