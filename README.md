## Documentation

* Explore the Terraform for Terraform [CLI](https://www.terraform.io/downloads.html).
* Explore the Nodejs for npm [CLI](https://nodejs.org/en/).
* Explore the Yarn for Yarn [CLI](https://classic.yarnpkg.com/en/docs/install#debian-stable).
* Explore the CDK for cdktf [CLI](https://github.com/hashicorp/terraform-cdk/blob/main/docs/cli-commands.md).


Add your AWS credentials as two environment variables, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, replacing AAAAAA with each respective values.
```shell
$ export AWS_ACCESS_KEY_ID=AAAAAA
$ export AWS_SECRET_ACCESS_KEY=AAAAA
```

# typescript-aws-vpc

A CDK for Terraform application in TypeScript for VPC configuraiton.

## Usage

Install project dependencies

```shell
yarn install
```

Generate CDK for Terraform constructs for Terraform provides and modules used in the project.

```bash
cdktf get
```

You can now edit the `main.ts` file if you want to modify any code.

```typescript
vim main.ts
import { Construct } from 'constructs';
import { App, TerraformOutput, TerraformStack } from 'cdktf';
import {AwsProvider,
  Eip,
  InternetGateway,
  NatGateway,
  Route,
  RouteTable,
  RouteTableAssociation,
  Subnet,
  Vpc} from './.gen/providers/aws/';


class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider (this ,'aws',{
      region : 'us-east-1',
    })

    // Create VPC with Typescript and CKDTF
    const newVpc = new Vpc (this , 'VPC',{
      cidrBlock: "10.0.0.0/16" ,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-VPC",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })
    
    // Create Two different Private subnets for assigning to the private network
    const privateSubnetA = new Subnet (this , 'Private-Subnet-A',{
      availabilityZone : "us-east-1a",
      vpcId : newVpc.id,
      mapPublicIpOnLaunch : false ,
      cidrBlock: "10.0.1.0/24" ,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Private-Subnet-A",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    const privateSubnetB = new Subnet (this , 'Private-Subnet-B',{
      availabilityZone : "us-east-1b",
      vpcId : newVpc.id,
      mapPublicIpOnLaunch : false ,
      cidrBlock: "10.0.2.0/24" ,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Private-Subnet-B",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    // Create Two different Public subnets for assigning to the public network
    const publicSubnetA = new Subnet (this , 'Public-Subnet-A',{
      availabilityZone : "us-east-1a",
      vpcId : newVpc.id,
      mapPublicIpOnLaunch : true ,
      cidrBlock: "10.0.6.0/24" ,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Public-Subnet-A",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    const publicSubnetB =  new Subnet (this , 'Public-Subnet-B',{
      availabilityZone : "us-east-1b",
      vpcId : newVpc.id,
      mapPublicIpOnLaunch : true ,
      cidrBlock: "10.0.7.0/24" ,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Public-Subnet-B",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })
    
    // Create Internet Gateway For communication VPC and Internet 
    const internetGatway = new InternetGateway (this , 'Internet-Gateway',{
      vpcId : newVpc.id,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-IG",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    // Create Two different Public IPs for assigning to the public network
    const publicipA = new Eip (this ,'eip-A',{
      vpc : true,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Public-eip-A",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    const publicipB = new Eip (this ,'eip-B',{
      vpc : true,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Public-eip-B",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    // Create Nat Gateway For communication Public and Private network
    const natgatewayA = new NatGateway (this , 'Nat-Gateway-A',{
      allocationId : publicipA.id ,
      subnetId: publicSubnetA.id ,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Public-NG-A",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    const natgatewayB = new NatGateway (this , 'Nat-Gateway-B',{
      allocationId : publicipB.id ,
      subnetId: publicSubnetB.id ,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Public-NG-B",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    // Create Routing Table For communication Public network with Route and Association route
    const publicroutetable =  new RouteTable (this , 'Public-Route-Table',{
      vpcId : newVpc.id,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Public-RT",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    new Route (this,'Route',{
      destinationCidrBlock: "0.0.0.0/0",
      routeTableId:publicroutetable.id,
      gatewayId : internetGatway.id,
    })

    new RouteTableAssociation (this , 'Route-Table-Association-PUB-SUB-A',{
      routeTableId:publicroutetable.id,
      subnetId:publicSubnetA.id
    })

    new RouteTableAssociation (this , 'Route-Table-Association-PUB-SUB-B',{
      routeTableId:publicroutetable.id,
      subnetId:publicSubnetB.id
    })

    // Create Routing Table For communication Private network with Route and Association route
    const privateroutetableA =  new RouteTable (this , 'Private-Route-Table-A',{
      vpcId : newVpc.id,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-Private-RT-A",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    new Route (this,'Private-Route-A',{
      destinationCidrBlock: "0.0.0.0/0",
      routeTableId : privateroutetableA.id,
      natGatewayId : natgatewayA.id,
    })

    new RouteTableAssociation (this , 'Route-Table-Association-Private-SUB-A',{
      routeTableId : privateroutetableA.id,
      subnetId : privateSubnetA.id
    })

    const privateroutetableB =  new RouteTable (this , 'Private-Route-Table-B',{
      vpcId : newVpc.id,
      tags: {
        "Name" : "CDKtf-TypeScript-Demo-private-RT-B",
        "Team" : "DevOps",
        "Company": "Your Comapny"
      }
    })

    new Route (this,'Private-Route-B',{
      destinationCidrBlock: "0.0.0.0/0",
      routeTableId:privateroutetableB.id,
      natGatewayId : natgatewayB.id,
    })

    new RouteTableAssociation (this , 'Route-Table-Association-Private-SUB-B',{
      routeTableId : privateroutetableB.id,
      subnetId : privateSubnetB.id
    })

    new TerraformOutput (this ,'Vpc id',{
      value : newVpc.id,
    })
  }
}

const app = new App();
new MyStack(app, 'aws-kms');
app.synth();
```

Compile the TypeScript application

```bash
tsc
```
At this step you can run code with two different way:

# The first way:

Generate Terraform configuration

```bash
cdktf synth
```

The above command will create a folder called `cdktf.out` that contains all Terraform JSON configuration that was generated.

Run Terraform commands

```bash
cd cdktf.out
terraform init
terraform plan
terraform apply
```

# The second way:

Run cdktf commands

```bash
cdktf deploy
```
