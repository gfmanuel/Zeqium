package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

// --- ESTRUCTURAS DE DATOS ---

type DID struct {
	AssetType          string `json:"assetType"`
	ID                 string `json:"id"`
	PublicKeyMultibase string `json:"publicKeyMultibase"`
	Controller         string `json:"controller"`
	Created            string `json:"created"`
	Status             string `json:"status"`
}

type CredentialStatus struct {
	AssetType        string `json:"assetType"`
	ID               string `json:"id"`
	Issuer           string `json:"issuer"`
	Status           string `json:"status"`
	RevocationReason string `json:"revocationReason"`
	UpdatedAt        string `json:"updatedAt"`
}

type Schema struct {
	AssetType  string   `json:"assetType"`
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Version    string   `json:"version"`
	Attributes []string `json:"attributes"`
	IssuerDID  string   `json:"issuerDID"`
}

type CredentialDefinition struct {
	AssetType  string `json:"assetType"`
	ID         string `json:"id"`
	SchemaID   string `json:"schemaId"`
	IssuerDID  string `json:"issuerDID"`
	PublicKeys string `json:"publicKeys"`
}

type AuditLog struct {
	AssetType   string `json:"assetType"`
	ID          string `json:"id"`
	Timestamp   string `json:"timestamp"`
	VerifierDID string `json:"verifierDID"`
	Resultado   string `json:"resultado"`
}

// --- A. GESTIÓN DE IDENTIDADES ---

func (s *SmartContract) RegisterDID(ctx contractapi.TransactionContextInterface, id string, pubKey string, controller string, timestamp string) error {
	did := DID{
		AssetType:          "DID",
		ID:                 id,
		PublicKeyMultibase: pubKey,
		Controller:         controller,
		Created:            timestamp,
		Status:             "ACTIVE",
	}
	didBytes, _ := json.Marshal(did)
	return ctx.GetStub().PutState(id, didBytes)
}

func (s *SmartContract) ResolveDID(ctx contractapi.TransactionContextInterface, id string) (*DID, error) {
	didBytes, err := ctx.GetStub().GetState(id)
	if err != nil || didBytes == nil {
		return nil, fmt.Errorf("DID no encontrado")
	}
	var did DID
	err = json.Unmarshal(didBytes, &did)
	return &did, err
}

func (s *SmartContract) DeactivateDID(ctx contractapi.TransactionContextInterface, id string) error {
	didBytes, err := ctx.GetStub().GetState(id)
	if err != nil || didBytes == nil {
		return fmt.Errorf("DID no encontrado")
	}
	var did DID
	json.Unmarshal(didBytes, &did)

	did.Status = "INACTIVE"
	updatedBytes, _ := json.Marshal(did)
	return ctx.GetStub().PutState(id, updatedBytes)
}

// --- B. ESTADO Y REVOCACIÓN ---

func (s *SmartContract) PublishCredentialStatus(ctx contractapi.TransactionContextInterface, hash string, issuer string, timestamp string) error {
	status := CredentialStatus{
		AssetType: "CredentialStatus",
		ID:        hash,
		Issuer:    issuer,
		Status:    "ACTIVE",
		UpdatedAt: timestamp,
	}
	statusBytes, _ := json.Marshal(status)
	return ctx.GetStub().PutState(hash, statusBytes)
}

func (s *SmartContract) RevokeCredential(ctx contractapi.TransactionContextInterface, hash string, reason string, timestamp string) error {
	statusBytes, err := ctx.GetStub().GetState(hash)
	if err != nil || statusBytes == nil {
		return fmt.Errorf("credencial no encontrada")
	}
	var status CredentialStatus
	json.Unmarshal(statusBytes, &status)
	
	status.Status = "REVOKED"
	status.RevocationReason = reason
	status.UpdatedAt = timestamp
	
	updatedBytes, _ := json.Marshal(status)
	err = ctx.GetStub().PutState(hash, updatedBytes)
	ctx.GetStub().SetEvent("CredentialRevoked", updatedBytes)
	return err
}

func (s *SmartContract) VerifyCredentialStatus(ctx contractapi.TransactionContextInterface, hash string) (*CredentialStatus, error) {
	statusBytes, err := ctx.GetStub().GetState(hash)
	if err != nil || statusBytes == nil {
		return nil, fmt.Errorf("estado no encontrado")
	}
	var status CredentialStatus
	json.Unmarshal(statusBytes, &status)
	return &status, nil
}

// --- C. ESQUEMAS ---

func (s *SmartContract) RegisterSchema(ctx contractapi.TransactionContextInterface, schemaID string, name string, version string, attributesJSON string, issuerDID string) error {
	var attributes []string
	_ = json.Unmarshal([]byte(attributesJSON), &attributes)

	schema := Schema{
		AssetType:  "Schema",
		ID:         schemaID,
		Name:       name,
		Version:    version,
		Attributes: attributes,
		IssuerDID:  issuerDID,
	}
	schemaBytes, _ := json.Marshal(schema)
	return ctx.GetStub().PutState(schemaID, schemaBytes)
}

func (s *SmartContract) GetSchema(ctx contractapi.TransactionContextInterface, schemaID string) (*Schema, error) {
	schemaBytes, err := ctx.GetStub().GetState(schemaID)
	if err != nil || schemaBytes == nil {
		return nil, fmt.Errorf("esquema no encontrado")
	}
	var schema Schema
	json.Unmarshal(schemaBytes, &schema)
	return &schema, nil
}

func (s *SmartContract) CreateCredentialDefinition(ctx contractapi.TransactionContextInterface, credDefID string, schemaID string, issuerDID string, publicKeys string) error {
	credDef := CredentialDefinition{
		AssetType:  "CredentialDefinition",
		ID:         credDefID,
		SchemaID:   schemaID,
		IssuerDID:  issuerDID,
		PublicKeys: publicKeys,
	}
	credDefBytes, _ := json.Marshal(credDef)
	return ctx.GetStub().PutState(credDefID, credDefBytes)
}

func (s *SmartContract) GetCredentialDefinition(ctx contractapi.TransactionContextInterface, credDefID string) (*CredentialDefinition, error) {
	credDefBytes, err := ctx.GetStub().GetState(credDefID)
	if err != nil || credDefBytes == nil {
		return nil, fmt.Errorf("Credential definition no encontrada")
	}
	var credDef CredentialDefinition
	json.Unmarshal(credDefBytes, &credDef)
	return &credDef, nil
}

// --- D. AUDITORÍA ---

func (s *SmartContract) LogVerificationActivity(ctx contractapi.TransactionContextInterface, logID string, timestamp string, verifierDID string, proofHash string) error {
	auditLog := AuditLog{
		AssetType:   "AuditLog",
		ID:          logID,
		Timestamp:   timestamp,
		VerifierDID: verifierDID,
		Resultado:   proofHash,
	}
	logBytes, _ := json.Marshal(auditLog)
	err := ctx.GetStub().PutState(logID, logBytes)
	ctx.GetStub().SetEvent("NewCheckin", logBytes)
	return err
}

func (s *SmartContract) GetAuditLogs(ctx contractapi.TransactionContextInterface, verifierDID string) ([]*AuditLog, error) {
	queryString := fmt.Sprintf(`{"selector":{"assetType":"AuditLog","verifierDID":"%s"}}`, verifierDID)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var logs []*AuditLog
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var log AuditLog
		json.Unmarshal(queryResponse.Value, &log)
		logs = append(logs, &log)
	}
	return logs, nil
}

func (s *SmartContract) GetIssuerCredentialHistory(ctx contractapi.TransactionContextInterface, issuerDID string) ([]*CredentialStatus, error) {
	queryString := fmt.Sprintf(`{"selector":{"assetType":"CredentialStatus","issuer":"%s"}}`, issuerDID)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var history []*CredentialStatus
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var status CredentialStatus
		json.Unmarshal(queryResponse.Value, &status)
		history = append(history, &status)
	}
	return history, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creando chaincode Zeqium: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("Error iniciando chaincode Zeqium: %v", err)
	}
}
