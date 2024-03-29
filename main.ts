import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import {
  AwsProvider,
  vpc,
  ec2
} from "./.gen/providers/aws/";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "aws", {
      region: "us-east-1",
    });

    // Create VPC with Typescript and CKDTF
    const newVpc = new vpc.Vpc(this, "VPC", {
      cidrBlock: "10.0.0.0/16",
      tags: {
        Name: "CDKtf-TypeScript-Demo-VPC",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    // Create Two different Private subnets for assigning to the private network
    const privateSubnetA = new vpc.Subnet(this, "Private-Subnet-A", {
      availabilityZone: "us-east-1a",
      vpcId: newVpc.id,
      mapPublicIpOnLaunch: false,
      cidrBlock: "10.0.1.0/24",
      tags: {
        Name: "CDKtf-TypeScript-Demo-Private-Subnet-A",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    const privateSubnetB = new vpc.Subnet(this, "Private-Subnet-B", {
      availabilityZone: "us-east-1b",
      vpcId: newVpc.id,
      mapPublicIpOnLaunch: false,
      cidrBlock: "10.0.2.0/24",
      tags: {
        Name: "CDKtf-TypeScript-Demo-Private-Subnet-B",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    // Create Two different Public subnets for assigning to the public network
    const publicSubnetA = new vpc.Subnet(this, "Public-Subnet-A", {
      availabilityZone: "us-east-1a",
      vpcId: newVpc.id,
      mapPublicIpOnLaunch: true,
      cidrBlock: "10.0.6.0/24",
      tags: {
        Name: "CDKtf-TypeScript-Demo-Public-Subnet-A",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    const publicSubnetB = new vpc.Subnet(this, "Public-Subnet-B", {
      availabilityZone: "us-east-1b",
      vpcId: newVpc.id,
      mapPublicIpOnLaunch: true,
      cidrBlock: "10.0.7.0/24",
      tags: {
        Name: "CDKtf-TypeScript-Demo-Public-Subnet-B",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    // Create Internet Gateway For communication VPC and Internet
    const internetGatway = new vpc.InternetGateway(this, "Internet-Gateway", {
      vpcId: newVpc.id,
      tags: {
        Name: "CDKtf-TypeScript-Demo-IG",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    // Create Two different Public IPs for assigning to the public network
    const publicipA = new ec2.Eip(this, "eip-A", {
      vpc: true,
      tags: {
        Name: "CDKtf-TypeScript-Demo-Public-eip-A",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    const publicipB = new ec2.Eip(this, "eip-B", {
      vpc: true,
      tags: {
        Name: "CDKtf-TypeScript-Demo-Public-eip-B",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    // Create Nat Gateway For communication Public and Private network
    const natgatewayA = new vpc.NatGateway(this, "Nat-Gateway-A", {
      allocationId: publicipA.id,
      subnetId: publicSubnetA.id,
      tags: {
        Name: "CDKtf-TypeScript-Demo-Public-NG-A",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    const natgatewayB = new vpc.NatGateway(this, "Nat-Gateway-B", {
      allocationId: publicipB.id,
      subnetId: publicSubnetB.id,
      tags: {
        Name: "CDKtf-TypeScript-Demo-Public-NG-B",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    // Create Routing Table For communication Public network with Route and Association route
    const publicroutetable = new vpc.RouteTable(this, "Public-Route-Table", {
      vpcId: newVpc.id,
      tags: {
        Name: "CDKtf-TypeScript-Demo-Public-RT",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    new vpc.Route(this, "Route", {
      destinationCidrBlock: "0.0.0.0/0",
      routeTableId: publicroutetable.id,
      gatewayId: internetGatway.id,
    });

    new vpc.RouteTableAssociation(this, "Route-Table-Association-PUB-SUB-A", {
      routeTableId: publicroutetable.id,
      subnetId: publicSubnetA.id,
    });

    new vpc.RouteTableAssociation(this, "Route-Table-Association-PUB-SUB-B", {
      routeTableId: publicroutetable.id,
      subnetId: publicSubnetB.id,
    });

    // Create Routing Table For communication Private network with Route and Association route
    const privateroutetableA = new vpc.RouteTable(this, "Private-Route-Table-A", {
      vpcId: newVpc.id,
      tags: {
        Name: "CDKtf-TypeScript-Demo-Private-RT-A",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    new vpc.Route(this, "Private-Route-A", {
      destinationCidrBlock: "0.0.0.0/0",
      routeTableId: privateroutetableA.id,
      natGatewayId: natgatewayA.id,
    });

    new vpc.RouteTableAssociation(this, "Route-Table-Association-Private-SUB-A", {
      routeTableId: privateroutetableA.id,
      subnetId: privateSubnetA.id,
    });

    const privateroutetableB = new vpc.RouteTable(this, "Private-Route-Table-B", {
      vpcId: newVpc.id,
      tags: {
        Name: "CDKtf-TypeScript-Demo-private-RT-B",
        Team: "DevOps",
        Company: "Your Comapny",
      },
    });

    new vpc.Route(this, "Private-Route-B", {
      destinationCidrBlock: "0.0.0.0/0",
      routeTableId: privateroutetableB.id,
      natGatewayId: natgatewayB.id,
    });

    new vpc.RouteTableAssociation(this, "Route-Table-Association-Private-SUB-B", {
      routeTableId: privateroutetableB.id,
      subnetId: privateSubnetB.id,
    });

    new TerraformOutput(this, "Vpc id", {
      value: newVpc.id,
    });
  }
}

const app = new App();
new MyStack(app, "cdktf-typescript-aws-vpc");
app.synth();
